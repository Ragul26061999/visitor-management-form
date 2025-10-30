# QR Code Functionality Implementation

## Overview
This document explains how the QR code scanning functionality works in the visitor management system.

## Workflow

1. **QR Code Generation**: The home page generates a QR code that contains URL parameters with visitor data
2. **QR Code Scanning**: When a user scans the QR code, they are redirected to `/visitor/scan` with the data as URL parameters
3. **Data Processing**: The scan page processes the URL parameters and stores them in Firestore
4. **Form Redirection**: The user is then redirected to the visitor form with the stored data

## Data Structure
The QR code contains the following parameters:
- `checkInTime`: Timestamp of visitor check-in
- `checkOutTime`: Timestamp of visitor check-out
- `email`: Visitor's email address
- `hostDepartment`: Department of the person being visited
- `hostPerson`: Name of the person being visited
- `mobileNumber`: Visitor's phone number
- `status`: Current status of the visitor (checked-in/checked-out)
- `visitPurpose`: Purpose of the visit
- `visitorName`: Name of the visitor
- `visitorType`: Type of visitor

## Implementation Details

### Files Modified/Added:
1. `/app/visitor/scan/page.tsx` - Handles QR code data processing
2. `/app/test-qr/page.tsx` - Test page for QR code functionality
3. `/app/page.tsx` - Updated to include test QR link
4. `/app/visitor/form/page.tsx` - Updated to handle pre-filled data

### Data Storage Format
When data is stored in Firestore, it follows this structure:
```
{
  checkInTime: timestamp,
  checkOutTime: timestamp,
  createdAt: timestamp,
  email: string,
  hostDepartment: string,
  hostPerson: string,
  mobileNumber: string,
  schoolId: reference,
  status: string,
  visitPurpose: string,
  visitorId: string,
  visitorName: string,
  visitorType: string
}
```

## Testing
To test the functionality:
1. Visit the home page and click "View Test QR"
2. Scan the QR code (or click on it in a mobile browser)
3. The system will process the data and redirect to the form
4. The form should be pre-filled with the data from the QR code