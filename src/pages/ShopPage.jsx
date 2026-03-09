import Shop from '../components/Shop'
import './PageBanner.css'

export default function ShopPage() {
    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">Our Products</span>
                    <h1 className="page-banner-title">Shop</h1>
                    <p className="page-banner-desc">
                        Quality laptops and accessories from trusted brands — HP, Dell, Lenovo, Acer and more.
                    </p>
                </div>
            </div>
            <Shop showHeader={false} />
        </>
    )
}
