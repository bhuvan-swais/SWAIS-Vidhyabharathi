/* Mock notifications. Replace with GET /api/v1/granthalaya/notifications in integration phase. */

export const MOCK_NOTIFICATIONS = [
  {
    notification_id: 1,
    user_id: 102,
    type: "request_approved",
    message: "Your book request for 'Trigonometry — Advanced Problems' by S.L. Loney has been approved. The book will be added to the library shortly.",
    is_read: false,
    created_at: "2026-08-12T10:05:00",
  },
  {
    notification_id: 2,
    user_id: 105,
    type: "request_pending",
    message: "Your book request for 'India After Gandhi' by Ramachandra Guha has been received and is under review.",
    is_read: false,
    created_at: "2026-08-05T11:25:00",
  },
  {
    notification_id: 3,
    user_id: 104,
    type: "request_rejected",
    message: "Your book request for 'Artificial Intelligence: A Modern Approach' has been declined. Reason: The book is at an advanced undergraduate level and is not suitable for the current student age group.",
    is_read: true,
    created_at: "2026-07-22T15:05:00",
  },
  {
    notification_id: 4,
    user_id: 107,
    type: "report_resolved",
    message: "Your content report for 'Bharat Ka Itihas' has been reviewed and resolved. The factual error on page 178 has been flagged and the book record updated.",
    is_read: false,
    created_at: "2026-08-10T16:05:00",
  },
  {
    notification_id: 5,
    user_id: 103,
    type: "request_approved",
    message: "Your book request for 'Oxford English Dictionary for Schools' has been approved. It has been added to the Language Arts category.",
    is_read: true,
    created_at: "2026-08-15T09:35:00",
  },
  {
    notification_id: 6,
    user_id: 101,
    type: "request_approved",
    message: "Your book request for 'The Alchemist' by Paulo Coelho has been approved and is now available in the library for students.",
    is_read: true,
    created_at: "2026-07-28T10:35:00",
  },
  {
    notification_id: 7,
    user_id: 101,
    type: "book_added",
    message: "A new book 'Stories of Indian Saints' has been added to the Values & Ethics category. Click to view details.",
    is_read: false,
    created_at: "2026-08-18T09:00:00",
  },
  {
    notification_id: 8,
    user_id: 106,
    type: "request_rejected",
    message: "Your book request for 'Think and Grow Rich' has been declined. This book is not aligned with the current academic curriculum.",
    is_read: true,
    created_at: "2026-08-03T16:05:00",
  },
  {
    notification_id: 9,
    user_id: 102,
    type: "report_received",
    message: "Your content report for 'Physics: Concepts and Applications' has been received. Our team will review the reported issue shortly.",
    is_read: false,
    created_at: "2026-08-02T11:35:00",
  },
  {
    notification_id: 10,
    user_id: 103,
    type: "book_added",
    message: "New books have been added to the Literature category. Browse the library to discover new titles available for your students.",
    is_read: true,
    created_at: "2026-08-01T08:00:00",
  },
];

/* Notification type labels for display */
export const NOTIFICATION_TYPE_LABELS = {
  request_approved: "Request Approved",
  request_rejected: "Request Rejected",
  request_pending:  "Request Received",
  report_resolved:  "Report Resolved",
  report_received:  "Report Received",
  book_added:       "New Book",
};
