# 🎯 Antrian Cerdas (Smart Queue)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern digital queue management system built with React and Supabase. Create and manage queues efficiently with real-time updates and QR code integration.

## ✨ Features

- 🚀 **Real-time Updates**: Instant queue status changes
- 📱 **QR Code Integration**: Easy queue joining via QR code scan
- 🔐 **Secure Authentication**: Built-in user management
- 🎯 **Queue Management**: Efficient queue control dashboard
- 🌈 **Modern UI**: Responsive design with Tailwind CSS
- ⚡ **Performance**: Built with React and TypeScript

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **QR Code**: HTML5-QRCode

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm/yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/antrian-cerdas.git
cd antrian-cerdas
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 📱 Core Features

### Queue Creation
- Create custom queues with unique identifiers
- Generate shareable QR codes
- Set queue preferences and settings

### Queue Management
- Real-time queue monitoring
- Call next in line
- Mark entries as complete/skipped
- View queue statistics

### User Experience
- Join queues via QR code scan
- Real-time position updates
- Mobile-optimized interface
- Push notifications (coming soon)

## 🗄️ Database Schema

### Tables
- `queues`: Queue metadata and settings
- `queue_entries`: Individual queue entries
- `users`: User authentication and profiles

## 📸 Screenshots

### Create Queue Page
![Create Queue](./screenshots/create-queue.png)
*Create and manage your queue with an easy-to-use interface*

### Join Queue via QR
![Join Queue](./screenshots/join-queue.png)
*Customers can quickly join queues by scanning QR codes*

### Queue Management Dashboard
![Queue Management](./screenshots/manage-queue.png)
*Monitor and control your queue in real-time*

### Queue Status View
![Queue Status](./screenshots/view-queue.png)
*Users can track their position in the queue*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.io/) for the amazing backend service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [React Hot Toast](https://react-hot-toast.com/) for beautiful notifications

## 📬 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

<p align="center">Made with ❤️ for better queue management</p>
