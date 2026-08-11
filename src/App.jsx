import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { useJsonLd, useStaticRouteSeo } from './utils/useSeo'
import { useSiteContact } from './utils/useSiteContact'
import { siteGraph } from './utils/structuredData'
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
import NotFoundPage from './pages/NotFoundPage'
import WhatsAppFloat from './components/WhatsAppFloat'
// Admin — lazily loaded so the CMS doesn't ship in the public bundle.
// A customer browsing laptops has no reason to download the admin panel.
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'))
const AdminApplicationDetail = lazy(() => import('./pages/admin/AdminApplicationDetail'))
const AdminShop = lazy(() => import('./pages/admin/AdminShop'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))

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
  // Covers the eight static public routes. Shop category/product and the 404
  // page set their own metadata — see useStaticRouteSeo.
  useStaticRouteSeo()
  // Drives every WhatsApp link and the LocalBusiness phone/email/hours, so both
  // follow Admin → Content → Contact Details rather than hardcoded constants.
  const contact = useSiteContact()
  // Prerendered into the static HTML too, so non-JS crawlers see it as well.
  useJsonLd('site', siteGraph(contact))

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

// Suspense boundary for the lazily-loaded admin chunks.
//
// The fallback is styled inline on purpose: the admin spinner classes live in
// AdminLayout.css, which now ships inside the async chunk we're waiting on, so
// a class-based fallback would render unstyled.
function AdminSuspense() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <span aria-live="polite">Loading…</span>
        </div>
      }
    >
      <Outlet />
    </Suspense>
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
          {/* Unknown URLs previously rendered nothing at all — a blank page
              with a 200. Keep this last so it only catches real misses. */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin routes — no public layout, lazily loaded */}
        <Route element={<AdminSuspense />}>
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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
