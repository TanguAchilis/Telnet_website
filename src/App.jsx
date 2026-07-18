import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import TeamPage from './pages/TeamPage'
import GalleryPage from './pages/GalleryPage'
import ShopPage from './pages/ShopPage'
import ContactPage from './pages/ContactPage'
import InternshipPage from './pages/InternshipPage'
import WhatsAppFloat from './components/WhatsAppFloat'
// Admin
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApplications from './pages/admin/AdminApplications'
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'

function AnimationObserver() {
  const location = useLocation()

  useEffect(() => {
    // Re-observe animated elements on route change
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    // Small delay to let new page content render
    const timer = setTimeout(() => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll')
      animatedElements.forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      const animatedElements = document.querySelectorAll('.animate-on-scroll')
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [location])

  return null
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimationObserver />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/internship" element={<InternshipPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Admin routes — no public layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="applications/:id" element={<AdminApplicationDetail />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
