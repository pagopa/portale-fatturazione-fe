# Notifiche (Notifications) Page Test Plan

## Application Overview

The Notifiche page is a comprehensive notifications management interface that displays a filterable list of notifications (notifiche) for users. The page supports multiple user profiles (PAGOPA, SELFCARE, REC, CON) with role-based filtering and actions. Key features include advanced filtering by year, month, notification type, contestation status, CAP, recipient ID, and entity details; pagination with customizable row display; sorting by date; downloading notifications as CSV/XLSX; creating and managing contestations with modal dialogs; and accessing deadlines calendar. The interface integrates with local storage to persist filter selections and provides dynamic data loading based on user profile permissions.

## Test Scenarios

### 1. Filter Functionality

**Seed:** `tests/auth.setup.ts`

#### 1.1. Load page with default filters

**File:** `tests/notifiche/filter-defaults.spec.ts`

**Steps:**
  1. Navigate to the Notifiche page
    - expect: Page loads successfully
    - expect: Year filter shows current/most recent year
    - expect: Month filter shows first available month
    - expect: Grid displays notifications data or 'Non sono presenti notifiche' message
  2. Verify the filter panel is visible with all filter fields
    - expect: Anno (Year) dropdown is visible
    - expect: Mese (Month) dropdown is visible
    - expect: IUN input field is visible
    - expect: Tipo notifica filter is visible
    - expect: Contestazione (Contestation) filter is visible
    - expect: CAP filter is visible
    - expect: Recipient ID filter is visible
  3. Check that Filtra (Filter) and Annulla (Cancel) buttons are visible
    - expect: Filtra button is enabled
    - expect: Annulla button is disabled (no active filters)
    - expect: Download risultati button is visible

#### 1.2. Apply single filter - Year selection

**File:** `tests/notifiche/filter-year.spec.ts`

**Steps:**
  1. Open Anno (Year) dropdown and select a different year
    - expect: Dropdown opens and shows list of available years
    - expect: Selected year is highlighted
    - expect: Mese dropdown updates to show months available for selected year
  2. Click Filtra button
    - expect: Filter is applied
    - expect: Grid data refreshes with notifications from selected year
    - expect: Annulla button becomes enabled (active filter exists)
    - expect: Page number resets to 0
  3. Verify month selection updated automatically
    - expect: Mese filter shows first available month for selected year
    - expect: Data in grid reflects the selected year and month combination

#### 1.3. Apply single filter - Month selection

**File:** `tests/notifiche/filter-month.spec.ts`

**Steps:**
  1. Select a year first, then open Mese (Month) dropdown
    - expect: Dropdown shows available months for selected year
    - expect: Months are displayed in proper format (e.g., 'Gennaio', 'Febbraio')
  2. Select a month and click Filtra
    - expect: Filter is applied
    - expect: Grid displays notifications for selected year and month
    - expect: Page number resets to page 0
  3. Verify Annulla button is now enabled
    - expect: Annulla button shows 'show' status (not hidden)

#### 1.4. Apply IUN filter (text input)

**File:** `tests/notifiche/filter-iun.spec.ts`

**Steps:**
  1. Click on IUN input field and enter a valid IUN value
    - expect: Input accepts text
    - expect: Text is displayed in the field
  2. Click Filtra button
    - expect: Filter is applied
    - expect: Grid shows only notifications matching the IUN
    - expect: Annulla button is enabled
  3. Clear IUN field and click Filtra again
    - expect: IUN filter is removed
    - expect: Grid shows all notifications again

#### 1.5. Apply CAP filter (text input)

**File:** `tests/notifiche/filter-cap.spec.ts`

**Steps:**
  1. Enter a CAP value in the CAP filter field
    - expect: Input accepts text
    - expect: Text is displayed in the field
  2. Click Filtra button
    - expect: Filter is applied
    - expect: Grid displays only notifications with matching CAP
    - expect: Annulla button is enabled
  3. Leave CAP empty and click Filtra
    - expect: CAP filter is removed
    - expect: All notifications are displayed

#### 1.6. Apply Recipient ID filter

**File:** `tests/notifiche/filter-recipientid.spec.ts`

**Steps:**
  1. Enter a Recipient ID value
    - expect: Input accepts text
    - expect: Text is displayed correctly
  2. Click Filtra button
    - expect: Filter is applied
    - expect: Grid shows only matching notifications
    - expect: Annulla button is enabled

#### 1.7. Apply multiple filters together

**File:** `tests/notifiche/filter-multiple.spec.ts`

**Steps:**
  1. Select year, month, enter IUN, enter CAP, and select Tipo notifica
    - expect: All fields accept input
    - expect: Filter panel shows all selections
  2. Click Filtra button
    - expect: All filters are applied
    - expect: Grid displays data matching all criteria
    - expect: Annulla button shows enabled
  3. Verify filter persistence after page interaction
    - expect: Filters remain applied
    - expect: Grid data is consistent

#### 1.8. Cancel filters - Annulla button

**File:** `tests/notifiche/filter-cancel.spec.ts`

**Steps:**
  1. Apply multiple filters and verify Annulla button is enabled
    - expect: Annulla button is visible and enabled
  2. Click Annulla button
    - expect: All filters are reset to defaults
    - expect: Grid resets to show all available data
    - expect: Year shows most recent year
    - expect: Month shows first available month
    - expect: IUN/CAP/Recipient ID fields are cleared
    - expect: Annulla button becomes disabled

### 2. Grid Display and Pagination

**Seed:** `tests/auth.setup.ts`

#### 2.1. Grid displays notification data correctly

**File:** `tests/notifiche/grid-display.spec.ts`

**Steps:**
  1. Navigate to Notifiche page and wait for grid to load
    - expect: Grid is displayed
    - expect: Grid shows notification rows
    - expect: Each row displays notification details
  2. Verify grid columns are visible and contain data
    - expect: Grid columns are properly rendered
    - expect: Data is not null or empty (shows '--' for null values)
    - expect: Row height is set to 80px for readability
  3. Check empty state message
    - expect: When no data exists, message 'Non sono presenti notifiche' is displayed

#### 2.2. Pagination - Change page

**File:** `tests/notifiche/pagination-change-page.spec.ts`

**Steps:**
  1. Verify pagination controls are visible at bottom of grid
    - expect: Page number is displayed
    - expect: Next/Previous page buttons are visible
    - expect: Page size selector is visible showing options (10, 25, 50, 100)
  2. Click next page button
    - expect: Page number increments
    - expect: Grid data updates with next page results
    - expect: Loading indicator shows briefly
  3. Click previous page button
    - expect: Page number decrements
    - expect: Grid data updates with previous page results
  4. Click on specific page number
    - expect: Selected page data is displayed
    - expect: Grid refreshes with correct data

#### 2.3. Pagination - Change rows per page

**File:** `tests/notifiche/pagination-rows.spec.ts`

**Steps:**
  1. Click on page size dropdown (default 10)
    - expect: Dropdown opens showing options: 10, 25, 50, 100
  2. Select 25 rows per page
    - expect: Grid updates to show 25 rows
    - expect: Grid height adjusts accordingly
    - expect: Page resets to 0
    - expect: Loading indicator shows during update
  3. Select 50 rows per page
    - expect: Grid displays 50 rows
    - expect: Total rows match selection
  4. Select 100 rows per page
    - expect: Grid displays 100 rows
    - expect: Pagination updates correctly

#### 2.4. Row interaction - Click on notification

**File:** `tests/notifiche/grid-row-click.spec.ts`

**Steps:**
  1. Click on a notification row in the grid
    - expect: Row click triggers action (opens contestation modal or navigates)
    - expect: Correct notification data is passed to modal/view
  2. Click on action column button if present
    - expect: Action is triggered
    - expect: Modal or new view opens with notification details

#### 2.5. Server-side sorting by date

**File:** `tests/notifiche/grid-sorting.spec.ts`

**Steps:**
  1. Click on 'Data Evento' (Event Date) column header
    - expect: Sort indicator appears
    - expect: Data is sorted ascending by date
    - expect: Grid refreshes with sorted data
  2. Click 'Data Evento' column header again
    - expect: Sort direction reverses to descending
    - expect: Grid updates with reversed sort
  3. Click 'Data Evento' header third time
    - expect: Sort is removed (returns to default order)
    - expect: Sort indicator disappears

### 3. Download Functionality

**Seed:** `tests/auth.setup.ts`

#### 3.1. Download button visibility and state

**File:** `tests/notifiche/download-button-state.spec.ts`

**Steps:**
  1. Load the page and verify download button
    - expect: Download risultati button is visible
    - expect: Button label is 'Download risultati'
    - expect: Button has download icon
  2. Verify button is disabled when no data is present
    - expect: Download button is disabled when grid shows 'Non sono presenti notifiche'
    - expect: Button is disabled during loading
  3. Verify button is enabled when data exists
    - expect: Download button is enabled when grid contains notification rows

#### 3.2. Download notifications as file

**File:** `tests/notifiche/download-file.spec.ts`

**Steps:**
  1. Click Download risultati button when grid has data
    - expect: Loading modal appears with 'Downloading...' message
    - expect: File download is triggered
    - expect: File is saved with appropriate name (includes month and year)
  2. Verify downloaded file properties
    - expect: File is in CSV or XLSX format depending on profile
    - expect: File contains notification data
    - expect: File name follows pattern: 'Notifiche/[entity]/[month]/[year].[ext]'
  3. Check file content format
    - expect: CSV file has proper column headers
    - expect: Data rows are formatted correctly
    - expect: Special characters are properly escaped

#### 3.3. Download with active filters

**File:** `tests/notifiche/download-with-filters.spec.ts`

**Steps:**
  1. Apply filters (year, month, type, etc.) and click Download
    - expect: Download includes only filtered data
    - expect: File reflects the active filter criteria
  2. Download with single entity selected
    - expect: File name includes entity name: 'Notifiche/[EntityName]/[month]/[year]'
  3. Download with multiple entities selected
    - expect: File name shows generic pattern without entity name

#### 3.4. Download error handling

**File:** `tests/notifiche/download-error.spec.ts`

**Steps:**
  1. Attempt download with network error or API failure
    - expect: Error is handled gracefully
    - expect: Error modal is displayed with appropriate message
    - expect: Loading modal closes
  2. Verify error message guides user
    - expect: Error message is clear and actionable

### 4. Contestation Modal

**Seed:** `tests/auth.setup.ts`

#### 4.1. Open contestation modal

**File:** `tests/notifiche/contestation-modal-open.spec.ts`

**Steps:**
  1. Click on a notification row to open contestation modal
    - expect: Modal appears
    - expect: Modal title shows contestation form
    - expect: Modal contains notification details
  2. Verify modal loads contestation data for selected notification
    - expect: Contestation data is populated from API
    - expect: Loading indicator shows during data fetch
  3. Check modal displays correctly based on user profile
    - expect: Modal content varies for different profiles (PAGOPA, SELFCARE, REC, CON)
    - expect: Profile-specific fields are displayed

#### 4.2. Contestation modal - Expired deadline

**File:** `tests/notifiche/contestation-expired.spec.ts`

**Steps:**
  1. Click on notification when contestation deadline has passed
    - expect: Info modal appears instead of contestation modal
    - expect: Message 'Non è possibile creare una contestazione' is displayed
    - expect: User cannot proceed with contestation creation

#### 4.3. Contestation modal - Create contestation

**File:** `tests/notifiche/contestation-create.spec.ts`

**Steps:**
  1. Open contestation modal for valid notification
    - expect: Modal shows contestation form
    - expect: Contestation status is editable
  2. Fill in contestation details and submit
    - expect: Form accepts input
    - expect: Submit button saves contestation
    - expect: Modal closes on success
    - expect: Grid refreshes with updated data
  3. Verify contestation is saved and reflected in grid
    - expect: Notification status changes to show contestation
    - expect: Contestation data persists

### 5. Deadline Calendar (Scadenziario)

**Seed:** `tests/auth.setup.ts`

#### 5.1. Open deadline calendar

**File:** `tests/notifiche/scadenziario-open.spec.ts`

**Steps:**
  1. Click on Scadenzario button (calendar icon) in page header
    - expect: Deadline calendar modal opens
    - expect: Modal shows calendar view
    - expect: Calendar displays contestation deadlines
  2. Verify calendar displays all relevant dates
    - expect: Calendar shows current month
    - expect: Important dates are highlighted

#### 5.2. Interact with deadline calendar

**File:** `tests/notifiche/scadenziario-interact.spec.ts`

**Steps:**
  1. Navigate to different months in calendar
    - expect: Previous/Next month buttons work
    - expect: Calendar updates to show selected month
  2. Click on date in calendar
    - expect: Date is selected
    - expect: Related contestation deadlines are displayed
  3. Close calendar modal
    - expect: Modal closes properly
    - expect: Focus returns to main page

### 6. Profile-Specific Functionality

**Seed:** `tests/auth.setup.ts`

#### 6.1. PAGOPA profile - Admin filters

**File:** `tests/notifiche/profile-pagopa.spec.ts`

**Steps:**
  1. Login as PAGOPA admin profile
    - expect: Notifiche page loads for PAGOPA user
  2. Verify PAGOPA-specific filters are visible
    - expect: Rag. Soc. Ente (Entity) filter is visible
    - expect: Consolidatore (Consolidator) filter is visible
    - expect: Recapitista (Delivery Agent) filter is visible
    - expect: Tipo notifica appears as multi-checkbox
  3. Apply PAGOPA-specific filters
    - expect: Filters work correctly
    - expect: Data updates based on selections

#### 6.2. SELFCARE profile - User filters

**File:** `tests/notifiche/profile-selfcare.spec.ts`

**Steps:**
  1. Login as SELFCARE user
    - expect: Notifiche page loads
    - expect: PAGOPA-specific filters are hidden
  2. Verify SELFCARE-specific behavior
    - expect: Tipo notifica appears as dropdown (not multi-checkbox)
    - expect: Entity-related filters are not visible

#### 6.3. REC (Recapitista) profile

**File:** `tests/notifiche/profile-rec.spec.ts`

**Steps:**
  1. Login as REC profile user
    - expect: Notifiche page loads
    - expect: Profile-specific filters are available
  2. Verify download format for REC
    - expect: Downloaded file is CSV format

#### 6.4. CON (Consolidatore) profile

**File:** `tests/notifiche/profile-con.spec.ts`

**Steps:**
  1. Login as CON profile user
    - expect: Notifiche page loads with CON-specific settings
  2. Verify download format for CON
    - expect: Downloaded file is CSV format

### 7. Local Storage and Filter Persistence

**Seed:** `tests/auth.setup.ts`

#### 7.1. Filters are saved to local storage

**File:** `tests/notifiche/filters-persist.spec.ts`

**Steps:**
  1. Apply filters and change pagination settings
    - expect: Filters are saved to browser local storage
  2. Reload page
    - expect: Previous filters are restored
    - expect: Same year, month, and page number are loaded
    - expect: Grid displays data with restored filters
  3. Verify all filter types are persisted
    - expect: Text inputs (IUN, CAP, Recipient ID) are restored
    - expect: Selected dropdowns are restored
    - expect: Checkbox selections are restored
    - expect: Page and row count are restored

#### 7.2. Local storage is cleared on Annulla

**File:** `tests/notifiche/filters-clear.spec.ts`

**Steps:**
  1. Apply filters and click Annulla button
    - expect: Local storage is cleared
    - expect: All filters reset to defaults
  2. Reload page
    - expect: Page loads with default filters, not previous filters

### 8. Loading and Error States

**Seed:** `tests/auth.setup.ts`

#### 8.1. Loading indicator during data fetch

**File:** `tests/notifiche/loading-indicator.spec.ts`

**Steps:**
  1. Apply filters and observe page load
    - expect: Loading modal appears with 'Loading...' message
    - expect: Grid is disabled during loading
    - expect: Filtra and Annulla buttons are disabled
  2. Wait for data to load
    - expect: Loading modal disappears
    - expect: Grid displays data
    - expect: Buttons become enabled

#### 8.2. Error handling - No data found

**File:** `tests/notifiche/error-no-data.spec.ts`

**Steps:**
  1. Apply filters that return no results
    - expect: Grid shows empty state message 'Non sono presenti notifiche'
    - expect: Total count is 0

#### 8.3. Error handling - API error

**File:** `tests/notifiche/error-api.spec.ts`

**Steps:**
  1. Trigger API error (network failure or 500 error)
    - expect: Error is caught and handled
    - expect: Error modal is displayed
    - expect: User is informed of the issue

#### 8.4. Error handling - Redirect modal

**File:** `tests/notifiche/error-redirect.spec.ts`

**Steps:**
  1. Access page when required data is not complete
    - expect: Redirect modal appears
    - expect: Message indicates missing billing data: 'Per poter visualizzare la lista delle Notifiche è obbligatorio fornire i seguenti dati di fatturazione'
    - expect: User can dismiss modal and navigate back

### 9. Edge Cases and Negative Testing

**Seed:** `tests/auth.setup.ts`

#### 9.1. Rapid filter changes

**File:** `tests/notifiche/rapid-filter-changes.spec.ts`

**Steps:**
  1. Quickly change multiple filter values without clicking Filtra
    - expect: UI updates form state without errors
    - expect: Previous requests can be cancelled
  2. Click Filtra after rapid changes
    - expect: Latest filter state is sent to API
    - expect: Grid displays correct data

#### 9.2. Large dataset pagination

**File:** `tests/notifiche/large-dataset.spec.ts`

**Steps:**
  1. Navigate through pages with large number of total records
    - expect: Pagination works correctly
    - expect: No performance degradation
    - expect: Data loads within acceptable time
  2. Jump to last page
    - expect: Last page data loads correctly
    - expect: Row count on last page is less than or equal to page size

#### 9.3. Invalid filter input

**File:** `tests/notifiche/invalid-input.spec.ts`

**Steps:**
  1. Enter special characters or very long strings in text input fields
    - expect: Input is accepted or truncated
    - expect: No UI errors occur
    - expect: Filter still works
  2. Submit with invalid inputs
    - expect: API handles invalid inputs gracefully
    - expect: Appropriate error message is shown if needed

#### 9.4. Concurrent operations

**File:** `tests/notifiche/concurrent-ops.spec.ts`

**Steps:**
  1. Click Download while navigating pages
    - expect: Operations queue properly
    - expect: No race conditions occur
  2. Open modal while filter is loading
    - expect: Modal opens correctly
    - expect: Background data load continues
    - expect: No UI conflicts
