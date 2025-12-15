import { test, expect } from '@playwright/test';

test.describe('Unread Count Functionality', () => {
  test('should show unread badge when receiving message outside room', async ({ browser }) => {
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

    // User2 leaves the room (clicks the "나가기" button)
    // Handle the native browser confirm dialog
    page2.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
    });
    await page2.click('button:has-text("나가기")');
    await page2.waitForTimeout(2000); // Wait for leave process to complete
    console.log('✅ User2 left room');

    // Wait a bit to ensure User2 is on the chatrooms list page
    await page2.waitForTimeout(1000);

    // User1 sends a message
    const testMessage = `테스트 메시지 ${Date.now()}`;
    await page1.fill('input[placeholder*="메시지"]', testMessage);
    await page1.click('button[type="submit"]');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 sent message:', testMessage);

    // Wait for User2 to receive the unread notification
    await page2.waitForTimeout(2000);

    // Check if User2 sees the unread badge on the room
    // The badge should be a red circle with the unread count
    const unreadBadge = page2.locator(`div:has-text("${roomName}") >> .. >> div.bg-red-500`);

    console.log('🔍 Checking for unread badge...');

    // Take screenshots for debugging
    await page2.screenshot({ path: 'tests/screenshots/user2-after-message.png', fullPage: true });
    console.log('📸 Screenshot saved: tests/screenshots/user2-after-message.png');

    // Check if badge exists and contains "1"
    const badgeExists = await unreadBadge.count();
    console.log('📊 Unread badge count:', badgeExists);

    if (badgeExists > 0) {
      const badgeText = await unreadBadge.first().textContent();
      console.log('📊 Badge text:', badgeText);
      expect(badgeText).toBe('1');
    } else {
      console.error('❌ Unread badge not found!');
      // Get all chat room items for debugging
      const roomItems = await page2.locator('text=' + roomName).all();
      console.log('📊 Found room items:', roomItems.length);

      throw new Error('Unread badge not found on chat room list');
    }

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
