import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { User } from './models/User.js';
import crypto from 'crypto';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

async function runAuthTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PRODUCTION AUTHENTICATION VERIFICATION SUITE');
  console.log('======================================================\n');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  // 1. Connect to MongoDB Atlas
  console.log('1️⃣  Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`✅ Connected successfully to DB: ${mongoose.connection.name}`);

  const testEmail = `test.traveler.${Date.now()}@tripplanner.test`;
  const testPassword = 'Password123!';
  const newPassword = 'NewSecretPassword456!';

  try {
    // Clean up any stale test user
    await User.deleteMany({ email: { $regex: /@tripplanner\.test$/ } });

    // 2. Test Signup with New Account
    console.log('\n2️⃣  Testing user registration with valid data...');
    const user = new User({
      name: 'Test Traveler',
      email: testEmail,
      password: testPassword,
    });
    await user.save();
    console.log(`✅ User registered successfully with ID: ${user._id}`);
    console.log(`🔒 Hashed password stored: ${user.password.startsWith('$2') ? 'Valid Bcrypt Hash' : 'ERROR: Plaintext'}`);

    // 3. Test Duplicate Registration Prevention
    console.log('\n3️⃣  Testing duplicate email prevention...');
    let duplicatePrevented = false;
    try {
      const duplicateUser = new User({
        name: 'Imposter Traveler',
        email: testEmail,
        password: 'AnotherPassword999!',
      });
      await duplicateUser.save();
    } catch (err) {
      duplicatePrevented = true;
      console.log(`✅ Duplicate registration blocked by DB constraint! Code: ${err.code || err.name}`);
    }

    if (!duplicatePrevented) {
      throw new Error('Duplicate user was incorrectly allowed to be created!');
    }

    // 4. Test Login with Valid Credentials
    console.log('\n4️⃣  Testing login with valid credentials...');
    const userForLogin = await User.findOne({ email: testEmail }).select('+password');
    const isMatch = await userForLogin.comparePassword(testPassword);
    if (!isMatch) {
      throw new Error('Password verification failed for correct password!');
    }
    console.log('✅ Correct password successfully verified via bcrypt.compare()');

    // 5. Test Login with Invalid Credentials & Increment Attempt Count
    console.log('\n5️⃣  Testing login with invalid credentials...');
    const isWrongMatch = await userForLogin.comparePassword('WrongPassword!');
    if (isWrongMatch) {
      throw new Error('Invalid password was incorrectly accepted!');
    }
    console.log('✅ Incorrect password correctly rejected');

    // 6. Test Account Lockout Mechanism
    console.log('\n6️⃣  Testing brute-force lockout mechanism (5 failed attempts)...');
    for (let i = 1; i <= 5; i++) {
      await userForLogin.incLoginAttempts();
    }
    const lockedUser = await User.findById(userForLogin._id);
    console.log(`🔒 Account locked state: ${lockedUser.isLocked ? 'LOCKED' : 'UNLOCKED'} (Attempts: ${lockedUser.loginAttempts})`);
    if (!lockedUser.isLocked) {
      throw new Error('Account was not locked after 5 failed attempts!');
    }
    console.log('✅ Brute-force account lockout verified');

    // 7. Test Forgot-Password and Reset-Password Flow
    console.log('\n7️⃣  Testing password reset token generation...');
    const rawResetToken = userForLogin.createPasswordResetToken();
    await userForLogin.save({ validateBeforeSave: false });
    console.log('✅ Generated secure SHA-256 password reset token');

    console.log('8️⃣  Verifying and applying password reset with new password...');
    const hashedIncomingToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    const userToReset = await User.findOne({
      resetPasswordToken: hashedIncomingToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!userToReset) {
      throw new Error('Could not find user with valid unexpired reset token!');
    }

    userToReset.password = newPassword;
    userToReset.resetPasswordToken = null;
    userToReset.resetPasswordExpires = null;
    await userToReset.resetLoginAttempts();
    await userToReset.save();
    console.log('✅ Password successfully updated, token cleared, lockout reset');

    // 8. Test Login with New Password
    console.log('\n9️⃣  Testing login with newly reset password...');
    const userAfterReset = await User.findOne({ email: testEmail }).select('+password');
    const canLoginWithNew = await userAfterReset.comparePassword(newPassword);
    const cannotLoginWithOld = await userAfterReset.comparePassword(testPassword);

    if (!canLoginWithNew || cannotLoginWithOld) {
      throw new Error('New password verification failed or old password still valid!');
    }
    console.log('✅ Login with new password succeeded; old password rejected');

    // 9. Verify Safe Object Serialization
    console.log('\n🔟 Verifying safe user serialization (no secrets leaked)...');
    const safeObj = userAfterReset.toSafeObject();
    if (safeObj.password || safeObj.resetPasswordToken || safeObj.lockUntil) {
      throw new Error('Sensitive fields leaked in toSafeObject()!');
    }
    console.log('✅ toSafeObject() strips password, tokens, and internal state:');
    console.log(safeObj);

    // 10. Clean up test records
    await User.deleteOne({ _id: user._id });
    console.log('\n🧹 Test user cleaned up from database.');

    console.log('\n======================================================');
    console.log('🎉 ALL 10 AUTHENTICATION & SECURITY TESTS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected cleanly from database.');
  }
}

runAuthTests();

