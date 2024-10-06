# Registration Portal

This is a Next.js application developed for fest event registration. It allows users to sign in using Google OAuth and retrieve a unique QR code for event entry.

## 📋 Features
- **Google OAuth Authentication** for secure sign-in.
- **Event Registration** and retrieval of a personal QR code.
- **Verifier Panel** for verifying user at the venue.

## 📂 Project Setup

Follow the steps below to set up and run the project on your local machine.

### 1. Clone the Repository

To clone the repository, run the following command in your terminal:

```bash
git clone https://github.com/menacingsoul/fmc-registration-portal.git
```

### 2. Navigate to the Project Directory

```bash
cd fmc-registration-portal
```

### 3. Install Dependencies

Make sure you have [Node.js](https://nodejs.org/) installed. Run the following command to install the project dependencies:

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of your project directory and add the following environment variables:

```
MONGODB_URI=mongodb+srv://adarsh3:pass@cluster0.z9xzk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
VERIFIER_PIN=your_verifier_pin_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_EVENT_NAME=your_event_name
NEXT_PUBLIC_EVENT_TIME=your_event_time
NEXT_PUBLIC_EVENT_DATE=your_event_date
NEXT_PUBLIC_EVENT_VENUE=your_event_venue
```

### 5. Setting Up Google OAuth Client ID

1. Follow the [Google Cloud Console OAuth Documentation](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) to create your **Google OAuth Client ID**.
2. Add your generated `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the `.env.local` file.

### 6. Run the Application

After setting up your environment variables, run the following command to start the application:

```bash
npm run dev
```

The app should now be running on [http://localhost:3000](http://localhost:3000).

### 7. Environment Variables Explained

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Connection string for MongoDB database. |
| `VERIFIER_PIN` | PIN code for verifying users at the venue. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Client ID for OAuth login. |
| `NEXT_PUBLIC_EVENT_NAME` | Name of the event. |
| `NEXT_PUBLIC_EVENT_TIME` | Time of the event. |
| `NEXT_PUBLIC_EVENT_DATE` | Date of the event. |
| `NEXT_PUBLIC_EVENT_VENUE` | Venue of the event. |

## 👥 Contributing
Feel free to contribute by creating issues or submitting pull requests.

## ✨ Contact
For questions, feel free to contact [Menacingsoul](https://github.com/menacingsoul).

---

With this `README.md`, users will have clear instructions to get the project up and running. Let me know if you need any adjustments or additions!
