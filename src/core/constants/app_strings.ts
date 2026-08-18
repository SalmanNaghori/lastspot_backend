export const AppStrings = {
  Auth: {
    title: 'ActivityConnect Admin',
    subtitle: 'Mobile Activity & Requirements Control Backoffice',
    adminEmailLabel: 'Admin Email',
    emailPlaceholder: 'admin@activityconnect.com',
    passwordLabel: 'Password',
    signInButton: 'Sign In to Dashboard',
    signingIn: 'Signing In...',
    errors: {
      emailRequired: 'Email is required.',
      emailInvalid: 'Please enter a valid email address.',
      passwordRequired: 'Password is required.',
      passwordShort: 'Password must be at least 6 characters.',
      invalidCredentials: 'Invalid email or password. Please try again.',
      noPermission: 'This account does not have permission to access the Admin Panel.',
      unexpected: 'An unexpected error occurred. Please try again.'
    }
  },
  Navigation: {
    brand: 'ActivityConnect',
    portalType: 'Backoffice Portal',
    logout: 'Logout',
    adminFallbackName: 'Admin',
    groups: {
      main: 'MAIN',
      communication: 'COMMUNICATION',
      moderation: 'MODERATION',
      system: 'SYSTEM'
    },
    items: {
      dashboard: 'Dashboard',
      users: 'Users',
      requests: 'Requests / Posts',
      joinRequests: 'Join Applications',
      categories: 'Categories',
      notifications: 'Send Notifications',
      notificationsHistory: 'Notification History',
      reports: 'Reports & Flagged',
      devices: 'Registered Devices',
      settings: 'App Settings'
    }
  },
  Dashboard: {
    title: 'Platform Overview',
    subtitle: 'Real-time statistics across users, posts, join applications, and reports',
    loading: 'Loading platform analytics...',
    cards: {
      users: {
        title: 'Total Users',
        subtext: 'All registered accounts'
      },
      activeUsers: {
        title: 'Active Users',
        subtext: 'Currently active'
      },
      suspendedUsers: {
        title: 'Suspended Users',
        subtext: 'Temporarily blocked'
      },
      bannedUsers: {
        title: 'Banned Users',
        subtext: 'Permanently restricted'
      },
      deletedUsers: {
        title: 'Deleted Users',
        subtext: 'Soft deleted accounts'
      },
      requests: {
        title: 'Activity Posts',
        subtext: 'Published & Open'
      },
      joinRequests: {
        title: 'Pending Joins',
        subtext: 'Awaiting approval'
      },
      devices: {
        title: 'Total Devices',
        subtext: 'All registered devices'
      },
      androidDevices: {
        title: 'Android Devices',
        subtext: 'Android Platform'
      },
      iosDevices: {
        title: 'iOS Devices',
        subtext: 'iOS Platform'
      },
      reports: {
        title: 'Open Reports',
        subtext: 'Requires moderation review'
      }
    },
    sections: {
      userAnalytics: 'User Analytics',
      activityAnalytics: 'Activity & Device Analytics',
      newRegistrations: 'New Registrations',
      recentPosts: 'Recent Posts',
      recentDevices: 'Recent Devices',
      recentActivity: 'Recent Activity Posts',
      viewAll: 'View All',
      moderationQueue: 'Moderation Action Queue',
      goToModeration: 'Go to Moderation Hub',
      noRecentUsers: 'No recent users.',
      noRecentPosts: 'No recent posts.',
      noRecentDevices: 'No active devices.',
      userLabel: 'User: '
    }
  },
  Categories: {
    title: 'Categories Management',
    subtitle: 'Manage categories, order, and active status for the mobile app',
    addCategory: 'Add Category',
    loading: 'Loading categories...',
    noData: 'No categories found.',
    tableHeaders: {
      order: 'Order',
      iconName: 'Icon & Name',
      slug: 'Slug',
      description: 'Description',
      status: 'Status',
      actions: 'Actions'
    },
    status: {
      active: 'Active',
      disabled: 'Disabled'
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete'
    },
    modal: {
      createTitle: 'Create Category',
      editTitle: 'Edit Category',
      nameLabel: 'Name',
      namePlaceholder: 'e.g. Cricket',
      slugLabel: 'Slug',
      slugPlaceholder: 'e.g. cricket',
      iconLabel: 'Icon Emoji',
      iconPlaceholder: '🏏',
      orderLabel: 'Display Order',
      descLabel: 'Description',
      descPlaceholder: 'Short description...',
      isActiveLabel: 'Category is active',
      cancelBtn: 'Cancel',
      createBtn: 'Create Category',
      updateBtn: 'Update Category'
    },
    confirmDelete: 'Are you sure you want to delete this category?',
    alerts: {
      nameRequired: 'Category name is required',
      saveSuccess: 'Category saved successfully!',
      statusUpdated: 'Category status updated'
    }
  },
  Users: {
    title: 'User Management',
    subtitle: 'Filter, inspect and manage platform user statuses',
    searchPlaceholder: 'Search by name, email, or UUID...',
    loading: 'Loading users...',
    noData: 'No users found matching filters.',
    filters: {
      all: 'all',
      active: 'active',
      suspended: 'suspended',
      banned: 'banned',
      deleted: 'deleted'
    },
    tableHeaders: {
      user: 'User',
      phone: 'Phone',
      status: 'Status',
      softDelete: 'Soft Delete',
      actions: 'Actions'
    },
    actions: {
      inspect: 'Inspect'
    },
    status: {
      deleted: 'Deleted',
      notDeleted: 'Not Deleted',
      unknown: 'unknown'
    },
    details: {
      backBtn: '← Back to Users List',
      loading: 'Loading user details...',
      activateBtn: 'Activate',
      banBtn: 'Ban User'
    },
    alerts: {
      activated: 'User status updated to Active.',
      banned: 'User account permanently banned.'
    }
  },
  Devices: {
    title: 'Registered Devices',
    subtitle: 'Inventory of devices logged into the platform',
    loading: 'Loading devices...',
    noData: 'No devices found.',
    searchPlaceholder: 'Search by device model or user...',
    filters: {
      all: 'All Platforms',
      ios: 'iOS',
      android: 'Android',
      web: 'Web'
    },
    tableHeaders: {
      user: 'User',
      model: 'Device Model',
      platform: 'Platform',
      version: 'App Version'
    }
  },
  Requests: {
    title: 'Requests & Posts Management',
    subtitle: 'Manage activity posts, time-based requirements, and carpool seats',
    loading: 'Loading activity posts...',
    noData: 'No posts matching search criteria found.',
    createBtn: 'Create Request',
    searchPlaceholder: 'Search by post title, location, or creator...',
    filters: {
      allCategories: 'All Categories',
      allStatuses: 'All Statuses'
    },
    tableHeaders: {
      titleCategory: 'Title & Category',
      createdBy: 'Created By',
      location: 'Location',
      peopleNeeded: 'People Needed',
      status: 'Status',
      actions: 'Actions'
    },
    actions: {
      inspect: 'Inspect'
    },
    details: {
      backBtn: '← Back to Requests List',
      loading: 'Loading request details...',
      closeBtn: 'Close Post',
      republishBtn: 'Re-Publish',
      descriptionHeader: 'Post Description',
      noDescription: 'No detailed description provided.',
      peopleRequired: 'People Required',
      costPerHead: 'Cost Per Head',
      applicantsHeader: 'Interested Applicants',
      noApplicants: 'No user application recorded yet.',
      creatorHeader: 'Post Creator',
      adminCreator: 'Created by System Admin'
    },
    modal: {
      createTitle: 'Create New Activity Request / Post',
      titleLabel: 'Title *',
      titlePlaceholder: 'e.g. Need 2 Footballers for 7v7 match',
      categoryLabel: 'Category *',
      descLabel: 'Description',
      descPlaceholder: 'Provide match details, court booking info, or carpool guidelines...',
      locationLabel: 'Location / Pickup Venue *',
      locationPlaceholder: 'e.g. Dadar Swaminarayan Temple',
      dateLabel: 'Event Date & Time',
      peopleLabel: 'People Needed',
      costLabel: 'Cost Per Person',
      currencyLabel: 'Currency',
      cancelBtn: 'Cancel',
      publishBtn: 'Publish Activity Request'
    },
    alerts: {
      requiredFields: 'Title and Location are required!',
      published: 'Activity Request / Post published successfully!',
      statusUpdated: 'Request status updated'
    }
  },
  JoinRequests: {
    title: 'Join Applications',
    subtitle: 'Inspect user join requests submitted for activity posts',
    searchPlaceholder: 'Search applicant or post title...',
    loading: 'Loading applications...',
    noData: 'No applications found.',
    filters: {
      all: 'All Statuses'
    },
    tableHeaders: {
      applicant: 'Applicant',
      targetPost: 'Target Post',
      postOwner: 'Post Owner',
      note: 'Note',
      status: 'Status'
    }
  },
  Notifications: {
    title: 'Send Broadcast Notification',
    subtitle: 'Create in-app and push notifications for mobile users',
    form: {
      titleLabel: 'Notification Title *',
      titlePlaceholder: 'e.g. Weekend Cricket Tournament Announced!',
      messageLabel: 'Notification Message Body *',
      messagePlaceholder: 'Write your push notification message...',
      audienceLabel: 'Target Audience',
      scheduleLabel: 'Schedule Delivery (Optional)',
      infoBox: 'In-app records are dispatched instantly. Push token delivery triggers via Supabase Edge Function API.',
      sendBtn: 'Send Broadcast Now',
      scheduleBtn: 'Schedule Broadcast'
    },
    audiences: {
      all: 'All Registered Users',
      category: 'Category Interested Users',
      location: 'Location-based Radius'
    },
    history: {
      title: 'Notification History',
      subtitle: 'Logs of all dispatched push and in-app notifications',
      loading: 'Loading history...',
      tableHeaders: {
        titleMessage: 'Title & Message',
        audience: 'Audience',
        count: 'Recipient Count',
        status: 'Status',
        sentAt: 'Sent At'
      }
    },
    alerts: {
      requiredFields: 'Title and Message are required!',
      sent: 'Broadcast notification sent!',
      scheduled: 'Notification scheduled successfully!',
      pastDateError: 'Cannot schedule a notification in the past.'
    }
  },
  Reports: {
    title: 'Content & User Moderation',
    subtitle: 'Review user complaints regarding fake posts, harassment, or spam',
    loading: 'Loading reports...',
    noData: 'No reports found matching filters.',
    filters: {
      all: 'all',
      open: 'open',
      resolved: 'resolved',
      dismissed: 'dismissed'
    },
    tableHeaders: {
      reporter: 'Reporter',
      targetContent: 'Target Content',
      reason: 'Reason',
      description: 'Description',
      status: 'Status',
      actions: 'Actions'
    },
    actions: {
      resolve: 'Resolve',
      dismiss: 'Dismiss'
    },
    alerts: {
      dismissed: 'Report dismissed.',
      resolved: 'Report marked as resolved!'
    }
  },
  Settings: {
    title: 'App Settings & Remote Config',
    subtitle: 'Manage maintenance mode, app version enforcement, and feature flags',
    saveBtn: 'Save Configurations',
    flagsHeader: 'Activity Module Flags',
    flags: {
      chat: 'In-App Activity Chat',
      travel: 'Travel & Carpooling Posts',
      sports: 'Sports Match Scheduling'
    },
    maintenance: {
      header: 'Maintenance Mode',
      globalMaintenance: 'Enable Global Maintenance (All Versions)',
      addRuleBtn: 'Add Targeted Rule',
      rulePlatform: 'Platform Target',
      ruleVersions: 'Affected Versions (Comma Separated)',
      ruleTitle: 'Maintenance Title',
      ruleMessage: 'Maintenance Message',
      ruleActive: 'Rule Active'
    },
    version: {
      header: 'Version Control & Force Update',
      androidTab: 'Android',
      iosTab: 'iOS',
      minVersion: 'Global Minimum Supported Version',
      latestVersion: 'Latest Store Version',
      storeUrl: 'App Store URL',
      blockedHeader: 'Blocked / Force Update Versions',
      addBlockedBtn: 'Add Blocked Version',
      versionTarget: 'Version String (e.g. 1.0.1)',
      updateTitle: 'Update Dialog Title',
      updateMessage: 'Update Dialog Message',
      releaseNotes: 'Release Notes (Bulleted List)',
      addNoteBtn: 'Add Note'
    },
    alerts: {
      saved: 'App Settings Saved!',
      saveError: 'Failed to save app settings.'
    }
  },
  AdminRoles: {
    title: 'Admin Roles & Access Control',
    subtitle: 'Manage backoffice administrator credentials, moderator permissions, and role delegations.',
    assignRoleBtn: '+ Assign Admin Role',
    loading: 'Loading roles...',
    cards: {
      superAdmins: 'Super Admins',
      moderators: 'Moderators',
      totalStaff: 'Total Backoffice Staff'
    },
    tableHeaders: {
      user: 'User',
      role: 'Role',
      assignedDate: 'Assigned Date',
      actions: 'Actions'
    },
    roles: {
      admin: 'Admin',
      moderator: 'Moderator'
    },
    actions: {
      revoke: 'Revoke'
    },
    modal: {
      title: 'Assign Admin Role',
      searchPlaceholder: 'Search users to assign role...',
      noUsers: 'No active users found.',
      selectUserLabel: 'Select User',
      selectRoleLabel: 'Select Role',
      cancelBtn: 'Cancel',
      assignBtn: 'Assign Role'
    },
    createModal: {
      title: 'Create New Admin User',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. John Doe',
      emailLabel: 'Email Address',
      emailPlaceholder: 'admin@activityconnect.com',
      passwordLabel: 'Temporary Password',
      passwordPlaceholder: 'Minimum 6 characters',
      roleLabel: 'Select Role',
      cancelBtn: 'Cancel',
      createBtn: 'Create Account'
    },
    alerts: {
      revoked: 'Role revoked successfully.',
      assigned: 'Role assigned successfully.',
      selectUser: 'Please select a user and a role.',
      created: 'Admin user created successfully!',
      createError: 'Failed to create admin user.'
    }
  },
  Common: {
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    enabled: 'Enabled',
    disabled: 'Disabled',
    clearFilters: 'Clear Filters',
    pagination: {
      showingPage: 'Showing page',
      of: 'of',
      total: 'total',
      previous: 'Previous',
      next: 'Next'
    }
  }
};
