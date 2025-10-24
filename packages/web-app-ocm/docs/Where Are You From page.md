# Where Are You From

## Overview

The WAYF page allows users to select their cloud provider when accepting an invitation. It's accessible at the path `domain.tld/open-cloud-mesh/wayf?token=token`.

## Usage

### 1. Basic Functionality Test

Navigate to: `http://localhost:3000/open-cloud-mesh/wayf?token=test-token-123`

Expected behavior:

- Page loads with "Where Are You From?" header
- Shows loading state initially
- Displays list of available providers grouped by federation
- Search functionality works
- Manual provider input is available

### 2. URL Parameters Test

Test with different URL parameters:

- `?token=test-token-123` - Should show providers
- No token - Should show "You need a token for this feature to work"

**Note**: `providerDomain` is ALWAYS auto-detected from `window.location.hostname` and should NOT be passed in the URL for security reasons.

### 3. Provider Selection Test

- Click on any provider from the list
- Should redirect to the provider's accept-invite page with token and domain parameters

### 4. Manual Provider Test

- Enter a domain in the manual provider field (e.g., "example.com")
- Press Enter or click the input
- Should attempt to discover the provider and redirect

### 5. Search Functionality Test

- Type in the search box to filter providers
- Should filter by provider name or FQDN
- Clear search should show all providers again

### 6. Error Handling Test

- Test with invalid provider domains
- Should show appropriate error messages
- Should not crash the application

### 7. Self-Domain Prevention Test

**Test that users cannot select their own instance:**

- If `window.location.hostname` is `example.com`:
  - Federation list should NOT include any provider with FQDN `example.com`
  - Manual entry of `example.com` should show error
  - Manual entry of `http://example.com` should show error
  - Manual entry of `https://example.com:443` should show error
- Error message should be: "Invalid Provider Selection - You cannot select your own instance as a provider..."

### How It Works

1. **Federation List Filtering**: When loading federations from the backend, any provider whose domain matches `window.location.hostname` is automatically filtered out
2. **Provider Selection Validation**: If a user somehow selects their own domain from the list, an error message is shown
3. **Manual Entry Validation**: If a user manually enters their own domain, an error message is shown

### Error Message

When attempting to select own instance:

```
Title: Invalid Provider Selection
Message: You cannot select your own instance as a provider.
         Please select a different provider to establish a federated connection.
```

### Implementation Details

- Domain comparison is case-insensitive
- Protocols (`http://`, `https://`) are stripped before comparison
- Port numbers are stripped before comparison
- If backend returns the current instance in federations, it's automatically dropped from the list

## API Endpoints Used

### Backend Endpoints

- `GET /sciencemesh/federations` - Loads list of available federations (public endpoint)
- `POST /sciencemesh/discover` - Discovers provider's OCM API endpoint for manual entry (public endpoint)

### External OCM Discovery

- `https://{provider-domain}/.well-known/ocm` - OCM discovery endpoint (called by backend, not frontend)
- `https://{provider-domain}/ocm-provider` - Legacy OCM discovery endpoint (fallback)

## Expected URL Structure

When a provider is selected, the user is redirected to:

```
{provider-invite-accept-dialog}?token={token}&providerDomain={providerDomain}
```

**Important Clarification**:

- `providerDomain` = The domain **where the WAYF page is hosted** (YOUR domain, the inviting party)
- `provider-invite-accept-dialog` = The selected provider's invite acceptance URL

**Example Flow**:

1. User visits WAYF on: `your-domain.com/open-cloud-mesh/wayf?token=abc123`
2. User selects provider: CERNBox
3. User is redirected to: `qa.cernbox.cern.ch/accept?token=abc123&providerDomain=your-domain.com`
   - Note: `providerDomain` is `your-domain.com` (NOT `qa.cernbox.cern.ch`)

**How providerDomain is determined**:

- **ALWAYS** automatically extracted from `window.location.hostname`
- **NEVER** accepted from query string (security: prevents domain spoofing)
