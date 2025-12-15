import { test, expect } from '@playwright/test';

test.describe('All Rooms Unread Count', () => {
  test('all users should see unread badges for all rooms', async ({ browser }) => {
    // Create two separate browser contexts for two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User1 logs in (existing user)
    await page1.goto('http://localhost:3333/auth/login');
    await page1.fill('input[name="email"]', 'ongsya@gmail.com');
    await page1.fill('input[name="password"]', '1');
    await page1.click('button[type="submit"]');
    await page1.waitForURL('**/chatrooms', { timeout: 10000 });
    console.log('✅ User1 (신성무) logged in');

    // User2 logs in (existing user)
    await page2.goto('http://localhost:3333/auth/login');
    await page2.fill('input[name="email"]', 'ongsi2@naver.com');
    await page2.fill('input[name="password"]', '1');
    await page2.click('button[type="submit"]');
    await page2.waitForURL('**/chatrooms', { timeout: 10000 });
    console.log('✅ User2 (ongsi2) logged in');

    // Wait for room list to load
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // User1 enters "자유 수다방" and sends a message
    await page1.click('text="자유 수다방 💬"');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 entered 자유 수다방');

    const testMessage = `테스트 메시지 ${Date.now()}`;
    await page1.fill('input[placeholder*="메시지"]', testMessage);
    await page1.click('button[type="submit"]');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 sent message:', testMessage);

    // Wait for User2 to receive notification
    await page2.waitForTimeout(3000);

    // Check if User2 sees unread badge on "자유 수다방"
    const unreadBadge = page2.locator('text="자유 수다방 💬" >> .. >> div.bg-red-500');
    const badgeCount = await unreadBadge.count();
    console.log('📊 Unread badge count for User2:', badgeCount);

    if (badgeCount === 0) {
      // Take screenshot for debugging
      await page2.screenshot({ path: 'tests/screenshots/user2-no-badge.png', fullPage: true });
      throw new Error('User2 should see unread badge on 자유 수다방 but none found!');
    }

    const badgeText = await unreadBadge.first().textContent();
    console.log('📊 Badge text:', badgeText);
    expect(badgeText).toBe('1');
    console.log('✅ User2 sees unread badge correctly!');

    // Now test with a different room
    // User1 enters "개발자 모임" and sends a message
    await page1.click('text="개발자 모임 💻"');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 entered 개발자 모임');

    const testMessage2 = `개발자 메시지 ${Date.now()}`;
    await page1.fill('input[placeholder*="메시지"]', testMessage2);
    await page1.click('button[type="submit"]');
    await page1.waitForTimeout(1000);
    console.log('✅ User1 sent message in 개발자 모임:', testMessage2);

    // Wait for User2 to receive notification
    await page2.waitForTimeout(3000);

    // Check if User2 sees unread badge on "개발자 모임"
    const unreadBadge2 = page2.locator('text="개발자 모임 💻" >> .. >> div.bg-red-500');
    const badgeCount2 = await unreadBadge2.count();
    console.log('📊 Unread badge count for 개발자 모임:', badgeCount2);

    if (badgeCount2 === 0) {
      await page2.screenshot({ path: 'tests/screenshots/user2-no-badge-dev.png', fullPage: true });
      throw new Error('User2 should see unread badge on 개발자 모임 but none found!');
    }

    const badgeText2 = await unreadBadge2.first().textContent();
    console.log('📊 Badge text for 개발자 모임:', badgeText2);
    expect(badgeText2).toBe('1');
    console.log('✅ User2 sees unread badge on 개발자 모임 correctly!');

    // Check that User2 also still has badge on 자유 수다방
    const stillHasBadge = await page2.locator('text="자유 수다방 💬" >> .. >> div.bg-red-500').count();
    console.log('📊 자유 수다방 still has badge:', stillHasBadge > 0);
    expect(stillHasBadge).toBeGreaterThan(0);

    console.log('✅ All tests passed! User2 receives notifications from all rooms.');

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
