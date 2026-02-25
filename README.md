# Funds Dashboard

A modern Angular application for managing and viewing investment funds data.

- **Admin View**: Full table with filtering, sorting, pagination, view/edit actions
- **User View**: Clean, read-only detail page for each fund
- **Admin Edit**: Edit fund details with auto-save on change + delete with confirmation

Data is stored in a simple JSON file on the backend (Node.js + Express).

## Features

- Responsive UI 
- Real-time filtering 
- Column sorting 
- Auto-save edits in admin edit view
- Delete fund 
- Navigation: Admin → User View / Edit View 

## Tech Stack

- **Frontend**: Angular 19+, Bootstrap 5, Bootstrap Icons
- **Backend**: Node.js, Express, ts-node (simple JSON file storage)
- **State**: Angular Signals for reactive data
- **Routing**: Lazy-loaded routes

## Prerequisites

- Node.js ≥ 18
- npm or yarn
- Git

## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/SachiiR/fund-management-portal/
cd fund-management-portal
```
### 2. Install dependencies

#### Frontend (Angular)
```bash
cd frontend
npm install
```
#### Backend (Node.js + Express)
```bash
cd backend
npm install
cd ..
```
### 3. Prepare the data file
Ensure the file backend/data/funds_data.json exists and contains valid fund data (array of objects).
If the file is missing or invalid JSON → the app will show an error.

### 4. Run the application
Open two separate terminals:

#### Terminal 1 – Backend
```bash
cd backend
npm start
```
#### Terminal 2 – Frontend
```bash
ng serve
# or:
npm start
```
Default landing page redirects to /admin (funds table).

### Quick Test Flow

Go to http://localhost:4300/admin
See the funds table
Try filtering (search, dropdowns, min/max)
Click column headers to sort

Click a fund name → goes to User View (read-only detail)
From table → click pencil icon → goes to Admin Edit
Edit any field → changes auto-save after ~800ms
Click "Delete Fund" → confirm dialog → deletes & redirects

From edit → click "Cancel" → returns without saving

### Next Steps / Possible Enhancements

Add authentication
Move data to a database 
Add proper error logging
Add toast notifications for save/delete success
Export table to CSV
Unit/integration tests


### Notes
- Name: Sachini Rosa
- Email: sachii.r@gmail.com
- Message: Assesment for Full Stack developer position

