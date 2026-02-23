## ADDED Requirements

### Requirement: API key management
The UI SHALL provide a settings panel where the user can enter their OpenAI API key. The key SHALL be stored in localStorage and persisted across sessions. The key SHALL be displayed masked (e.g., `sk-pr••••••••`).

#### Scenario: First time setup
- **WHEN** the user opens the page and no API key is in localStorage
- **THEN** the LLM chat area shows a prompt to configure the API key in settings

#### Scenario: Save API key
- **WHEN** the user enters an API key and clicks save
- **THEN** the key is stored in localStorage and the LLM chat becomes functional

#### Scenario: Delete API key
- **WHEN** the user clicks delete in settings
- **THEN** the key is removed from localStorage

### Requirement: Chat with filtered companies
The UI SHALL provide a text input where the user can ask natural language questions. The system SHALL send the currently filtered companies' data as context to the OpenAI API along with the user's question.

#### Scenario: Ask question about filtered data
- **WHEN** the user has filtered to 30 companies and types "Melyik cégeknek van saját ERP szoftvere?"
- **THEN** the system sends the 30 companies' data + the question to OpenAI API and displays the response

#### Scenario: No API key configured
- **WHEN** the user tries to send a question without an API key
- **THEN** the system displays a message to configure the API key first

### Requirement: Context size management
The system SHALL limit the data sent to the LLM to prevent exceeding context limits. If more than 50 companies match the current filters, only essential fields (id, name, city, software types) SHALL be sent.

#### Scenario: Small result set
- **WHEN** the filtered set has 50 or fewer companies
- **THEN** all company fields are included in the LLM context

#### Scenario: Large result set
- **WHEN** the filtered set has more than 50 companies
- **THEN** only id, name, hq_city, and software type/name are sent to the LLM, with a note explaining the truncation

### Requirement: LLM response display
The system SHALL display the LLM response below the chat input. While waiting for a response, a loading indicator SHALL be shown.

#### Scenario: Loading state
- **WHEN** a question is sent to the API
- **THEN** a loading indicator is shown until the response arrives

#### Scenario: Response display
- **WHEN** the API returns a response
- **THEN** the response text is displayed below the chat input

#### Scenario: Error handling
- **WHEN** the API call fails (network error, invalid key, rate limit)
- **THEN** an error message is displayed to the user
