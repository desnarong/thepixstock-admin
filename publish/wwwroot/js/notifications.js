// SignalR Notification Handler
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notificationHub")
    .withAutomaticReconnect()
    .build();

// Notification types
const NotificationType = {
    NewOrder: 'new-order',
    PhotoUploaded: 'photo-uploaded',
    PaymentReceived: 'payment-received',
    UserRegistered: 'user-registered',
    SystemAlert: 'system-alert'
};

// Start connection
async function startConnection() {
    try {
        await connection.start();
        console.log("SignalR Connected");

        // Update connection status
        updateConnectionStatus(true);
    } catch (err) {
        console.log(err);
        setTimeout(startConnection, 5000);
    }
}

// Connection status indicator
function updateConnectionStatus(isConnected) {
    const statusIndicator = document.getElementById('connection-status');
    if (statusIndicator) {
        statusIndicator.className = isConnected ? 'text-success' : 'text-danger';
        statusIndicator.title = isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ';
    }
}

// Handle incoming notifications
connection.on("ReceiveNotification", function (notification) {
    console.log("Notification received:", notification);

    // Show toast notification
    showToastNotification(notification);

    // Update notification badge
    updateNotificationBadge();

    // Play notification sound
    playNotificationSound(notification.Type);

    // Update specific UI elements based on notification type
    handleNotificationType(notification);
});

// Show toast notification
function showToastNotification(notification) {
    const toastHtml = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
            <div class="toast-header">
                <img src="/assets/images/logo-sm.png" class="rounded me-2" alt="..." height="20">
                <strong class="me-auto">${getNotificationTitle(notification.Type)}</strong>
                <small>${formatTime(notification.Timestamp)}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${notification.Message}
            </div>
        </div>
    `;

    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
}

// Get notification title based on type
function getNotificationTitle(type) {
    const titles = {
        'new-order': 'คำสั่งซื้อใหม่',
        'photo-uploaded': 'อัพโหลดรูปภาพ',
        'payment-received': 'รับชำระเงิน',
        'user-registered': 'ผู้ใช้ใหม่',
        'system-alert': 'แจ้งเตือนระบบ'
    };
    return titles[type] || 'แจ้งเตือน';
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'inline-block';
    }
}

// Play notification sound
function playNotificationSound(type) {
    const audio = new Audio('/assets/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Could not play notification sound'));
}

// Handle specific notification types
function handleNotificationType(notification) {
    switch (notification.Type) {
        case NotificationType.NewOrder:
            // Update order counter
            updateOrderCounter();
            break;
        case NotificationType.PhotoUploaded:
            // Update pending photo count
            updatePendingPhotoCount();
            break;
        case NotificationType.PaymentReceived:
            // Update revenue display
            updateRevenueDisplay(notification.Data);
            break;
        case NotificationType.UserRegistered:
            // Update user count
            updateUserCount();
            break;
    }
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'เมื่อสักครู่';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString('th-TH');
}

// Connection event handlers
connection.onreconnecting(() => {
    console.log("Attempting to reconnect...");
    updateConnectionStatus(false);
});

connection.onreconnected(() => {
    console.log("Reconnected!");
    updateConnectionStatus(true);
});

connection.onclose(() => {
    console.log("Connection closed");
    updateConnectionStatus(false);
});

// Start the connection when page loads
document.addEventListener('DOMContentLoaded', function () {
    startConnection();
});

// Export for use in other modules
window.notificationHub = {
    connection,
    startConnection,
    NotificationType
};