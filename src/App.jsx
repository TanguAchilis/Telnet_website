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
import ShopCategoryPage from './pages/ShopCategoryPage'
import ShopProductPage from './pages/ShopProductPage'
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
import AdminShop from './pages/admin/AdminShop'
import AdminGallery from './pages/admin/AdminGallery'
import AdminContent from './pages/admin/AdminContent'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'

function AnimationObserver() {
  const location = useLocation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    // Observe all current animated elements not yet revealed.
    const observeAll = () => {
      document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach((el) => observer.observe(el))
    }

    observeAll()

    // Also observe elements added later (async data: products, gallery,
    // edited services/team) so dynamic content still reveals.
    const mutationObserver = new MutationObserver(() => observeAll())
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
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
          <Route path="/shop/:categorySlug" element={<ShopCategoryPage />} />
          <Route path="/shop/:categorySlug/:productId" element={<ShopProductPage />} />
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
            <Route path="shop" element={<AdminShop />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
