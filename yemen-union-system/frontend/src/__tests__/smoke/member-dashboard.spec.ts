/**
 * Smoke Test: Member Dashboard
 * 
 * This is a minimal smoke test to verify member dashboard endpoints
 * Run with: npm test or your test runner
 */

describe('Member Dashboard - Smoke Tests', () => {
    const BASE_URL = 'http://localhost/api';
    let authToken: string;
    let testMemberId: number;

    // Setup: Login as test member
    beforeAll(async () => {
        // TODO: Replace with actual test member credentials
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: '05XXXXXXXXX', // Replace with test member phone
                password: 'testpassword123'
            })
        });

        const loginData = await loginResponse.json();
        expect(loginResponse.status).toBe(200);
        expect(loginData.success).toBe(true);

        authToken = loginData.data.token;
        testMemberId = loginData.data.user.id;
    });

    describe('GET /api/member/dashboard', () => {
        it('should return 200 and dashboard data', async () => {
            const response = await fetch(`${BASE_URL}/member/dashboard`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('member');
            expect(data.data).toHaveProperty('kpis');
            expect(data.data).toHaveProperty('subscription');
            expect(data.data).toHaveProperty('upcomingActivities');
            expect(data.data).toHaveProperty('recentPosts');
            expect(data.data).toHaveProperty('notifications');
        });

        it('should return member data with correct structure', async () => {
            const response = await fetch(`${BASE_URL}/member/dashboard`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();
            const member = data.data.member;

            expect(member).toHaveProperty('id');
            expect(member).toHaveProperty('full_name');
            expect(member).toHaveProperty('member_id');
            expect(member).toHaveProperty('account_status');
        });
    });

    describe('GET /api/memberships/my', () => {
        it('should return 200 and subscription data', async () => {
            const response = await fetch(`${BASE_URL}/memberships/my`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('subscription');
        });
    });

    describe('GET /api/activities', () => {
        it('should return 200 and activities list', async () => {
            const response = await fetch(`${BASE_URL}/activities?status=published`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data.activities)).toBe(true);
        });
    });

    describe('PUT /api/member/profile', () => {
        it('should return 200 and update profile', async () => {
            const response = await fetch(`${BASE_URL}/member/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: 'Test Member Updated',
                    city: 'أرضروم',
                    university: 'جامعة أتاتورك',
                    faculty: 'كلية الهندسة'
                })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.user.full_name).toBe('Test Member Updated');
        });
    });

    describe('POST /api/auth/change-password', () => {
        it('should return 200 and change password', async () => {
            const response = await fetch(`${BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: 'testpassword123',
                    new_password: 'newpassword123'
                })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });

    describe('POST /api/activities/{id}/register', () => {
        it('should return 200 and register for activity', async () => {
            // First, get an activity ID
            const activitiesResponse = await fetch(`${BASE_URL}/activities?status=published`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const activitiesData = await activitiesResponse.json();

            if (activitiesData.data.activities.length === 0) {
                console.warn('No activities available for registration test');
                return;
            }

            const activityId = activitiesData.data.activities[0].id;

            const response = await fetch(`${BASE_URL}/activities/${activityId}/register`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });

    describe('GET /api/member/notifications', () => {
        it('should return 200 and notifications list', async () => {
            const response = await fetch(`${BASE_URL}/member/notifications`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data.notifications)).toBe(true);
        });
    });

    describe('POST /api/support/tickets', () => {
        it('should return 200 and create support ticket', async () => {
            const response = await fetch(`${BASE_URL}/support/tickets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: 'Test Support Ticket',
                    message: 'This is a test support ticket message.'
                })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.ticket).toHaveProperty('ticket_number');
        });
    });

    // Cleanup: Logout
    afterAll(async () => {
        await fetch(`${BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
    });
});

/**
 * MANUAL CHECKLIST (Run these manually in browser)
 * 
 * 1. Login as member → Should redirect to /member-dashboard
 * 2. KPI cards should display correct data
 * 3. Subscription card should show membership status
 * 4. Activities list should show upcoming activities
 * 5. Posts list should show recent posts
 * 6. Notifications should display
 * 7. Upload proof button should navigate to /memberships/payment-proof
 * 8. View payment history button should navigate to /payments/history
 * 9. Member cannot access /activities (admin route) - should redirect
 * 10. Member cannot access /posts (admin route) - should redirect
 * 11. Member cannot access /settings (president route) - should redirect
 * 12. Profile edit should save changes successfully
 * 13. Password change should work correctly
 * 14. Support ticket creation should work
 * 15. Activity registration should work
 */
