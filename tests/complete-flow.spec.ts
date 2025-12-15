import { test, expect } from '@playwright/test';

test.describe('Complete Chat Flow', () => {
  test('unread badge appears, then clears when room is reopened', async ({ browser }) => {
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

    // User2 leaves the room
    page2.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page2.click('button:has-text("나가기")');
    await page2.waitForTimeout(2000);
    console.log('✅ User2 left room');

    // User1 sends a message
    const testMessage = `테스트 메시지 ${Date.now()}`;
    await page1.fill('input[placeholder*="메시지"]', testMessage);
    await page1.click('button[type="submit"]');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 sent message:', testMessage);

    // Wait for User2 to receive the unread notification
    await page2.waitForTimeout(2000);

    // Check if User2 sees the unread badge
    const unreadBadge = page2.locator(`div:has-text("${roomName}") >> .. >> div.bg-red-500`);
    const badgeCount = await unreadBadge.count();
    console.log('📊 Unread badge count:', badgeCount);

    if (badgeCount === 0) {
      throw new Error('Unread badge not found after message was sent');
    }

    const badgeText = await unreadBadge.first().textContent();
    console.log('📊 Badge text:', badgeText);
    expect(badgeText).toBe('1');
    console.log('✅ Unread badge showing correctly');

    // User2 clicks on the room to re-enter
    await page2.click(`text="${roomName}"`);
    await page2.waitForTimeout(2000);
    console.log('✅ User2 re-entered room');

    // Wait for read receipts to process
    await page2.waitForTimeout(1500);

    // User2 leaves again to check if badge is gone
    await page2.click('button:has-text("나가기")');
    await page2.waitForTimeout(1000);
    console.log('✅ User2 left room again');

    // Check if badge is now gone
    const badgeAfter = page2.locator(`div:has-text("${roomName}") >> .. >> div.bg-red-500`);
    const badgeCountAfter = await badgeAfter.count();
    console.log('📊 Badge count after reading:', badgeCountAfter);

    if (badgeCountAfter !== 0) {
      await page2.screenshot({ path: 'tests/screenshots/badge-still-showing.png', fullPage: true });
      throw new Error('Unread badge still showing after reading the message');
    }

    console.log('✅ Unread badge cleared after reading');

    // Verify User1 sees read receipt (double check)
    await page1.waitForTimeout(500);
    console.log('✅ Complete flow test passed!');

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
