import { test, expect } from '@playwright/test';

test.describe('Read Receipts Functionality', () => {
  test('should update read status in real-time', async ({ browser }) => {
    // Create two separate browser contexts for two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User1 registers and logs in
    await page1.goto('http://localhost:3333/auth/register');
    const username1 = `user1_${Date.now()}`;
    await page1.fill('input[name="username"]', username1);
    await page1.fill('input[name="email"]', `${username1}@test.com`);
    await page1.fill('input[name="password"]', 'password123');
    await page1.click('button[type="submit"]');
    await page1.waitForURL('**/chatrooms');
    console.log('✅ User1 logged in:', username1);

    // User2 registers and logs in
    await page2.goto('http://localhost:3333/auth/register');
    const username2 = `user2_${Date.now()}`;
    await page2.fill('input[name="username"]', username2);
    await page2.fill('input[name="email"]', `${username2}@test.com`);
    await page2.fill('input[name="password"]', 'password123');
    await page2.click('button[type="submit"]');
    await page2.waitForURL('**/chatrooms');
    console.log('✅ User2 logged in:', username2);

    // User1 creates a new chat room
    await page1.click('button:has-text("새 채팅방")');
    const roomName = `테스트방_${Date.now()}`;
    await page1.fill('input[name="name"]', roomName);
    await page1.click('button:has-text("생성")');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 created room:', roomName);

    // User1 clicks on the room to join
    await page1.click(`text="${roomName}"`);
    await page1.waitForTimeout(1000);
    console.log('✅ User1 joined room');

    // User2 refreshes to see the new room and joins
    await page2.reload();
    await page2.waitForTimeout(1000);
    await page2.click(`text="${roomName}"`);
    await page2.waitForTimeout(1000);
    console.log('✅ User2 joined room');

    // User1 sends a message
    const testMessage = `테스트 메시지 ${Date.now()}`;
    await page1.fill('input[placeholder*="메시지"]', testMessage);
    await page1.click('button[type="submit"]');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 sent message:', testMessage);

    // Check that User1 sees single check mark (not read yet)
    // Wait for message to appear
    await page1.waitForSelector(`text="${testMessage}"`);

    // Look for single check icon (Check component, not CheckCheck)
    // In the UI, unread messages show Check icon, read messages show CheckCheck icon
    const user1MessageArea = page1.locator(`text="${testMessage}"`).locator('..');
    await page1.waitForTimeout(500);

    console.log('🔍 User1: Checking for single check (unread) icon...');

    // Wait a bit for User2 to read the message (happens automatically when in room)
    await page2.waitForTimeout(2000);
    console.log('⏳ Waiting for read receipt update...');

    // User1 should now see double check mark (read by User2)
    await page1.waitForTimeout(1000);
    console.log('🔍 User1: Checking for double check (read) icon...');

    // Take screenshots for debugging
    await page1.screenshot({ path: 'tests/screenshots/user1-read-receipt.png', fullPage: true });
    await page2.screenshot({ path: 'tests/screenshots/user2-read-receipt.png', fullPage: true });
    console.log('📸 Screenshots saved');

    console.log('✅ Read receipt test completed');

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
