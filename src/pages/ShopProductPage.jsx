import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchShopProduct, formatPrice } from '../utils/content'
import { getWhatsAppUrl } from '../utils/whatsapp'
import { resolveMeta, shopProductMeta } from '../utils/seo'
import { breadcrumbSchema, productSchema } from '../utils/structuredData'
import { useJsonLd, useSeo } from '../utils/useSeo'
import './ShopFlow.css'
import { Icon } from '../icons'

export default function ShopProductPage() {
    const { categorySlug, productId } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(null)

    useEffect(() => {
        let active = true
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on product change
        setLoading(true)
        fetchShopProduct(productId)
            .then((p) => {
                if (!active) return
                setProduct(p)
                setActiveImage(p?.image_url || (Array.isArray(p?.images) ? p.images[0] : null) || null)
            })
            .catch(() => { /* show not found */ })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [productId])

    // Called before the early returns below so hook order stays stable.
    const seoPath = `/shop/${product?.category?.slug || categorySlug}/${productId}`
    useSeo(
        product
            ? shopProductMeta(product, product.category?.name, seoPath)
            : loading
              ? null // still fetching, so don't advertise a title we may have to retract
              : resolveMeta(seoPath, {
                  title: 'Product not found | Telnet Cameroon',
                  description: 'This item may no longer be available. Browse our shop or message us on WhatsApp to ask what is in stock.',
                  noindex: true,
              })
    )

    useJsonLd('product', product ? productSchema(product, product.category?.name, seoPath) : null)
    useJsonLd(
        'breadcrumb',
        product
            ? breadcrumbSchema([
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: product.category?.name || 'Shop', path: `/shop/${product.category?.slug || categorySlug}` },
                { name: product.name, path: seoPath },
            ])
            : null
    )

    if (loading) {
        return (
            <div className="section container">
                <div className="shopf-loading"><span className="shopf-spinner" />Loading…</div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="section container">
                <div className="shopf-empty">
                    <span className="shopf-empty-icon"><Icon name="search" size={34} /></span>
                    <h3>Product not found</h3>
                    <p>This item may no longer be available.</p>
                    <Link to={`/shop/${categorySlug}`} className="btn btn-primary">Back to category</Link>
                </div>
            </div>
        )
    }

    const priceText = formatPrice(product.price, product.price_note)
    const gallery = [product.image_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean)
    const uniqueGallery = [...new Set(gallery)]
    const catSlug = product.category?.slug || categorySlug
    const catName = product.category?.name || 'Shop'

    const waMessage = `Hello Telnet Cameroon! I'm interested in "${product.name}"`
        + (product.price != null ? ` priced at ${priceText}` : '')
        + ` from your shop. Is it still available?`

    return (
        <section className="section shopf-section">
            <div className="container">
                <nav className="shopf-breadcrumb shopf-breadcrumb-dark">
                    <Link to="/shop">Shop</Link>
                    <span aria-hidden="true">/</span>
                    <Link to={`/shop/${catSlug}`}>{catName}</Link>
                    <span aria-hidden="true">/</span>
                    <span>{product.name}</span>
                </nav>

                <div className="shopf-detail">
                    <div className="shopf-detail-media">
                        <div className="shopf-detail-main">
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} />
                            ) : (
                                <span className="shopf-product-placeholder shopf-placeholder-lg"><Icon name="image" size={64} /></span>
                            )}
                            {!product.in_stock && <span className="shopf-badge shopf-badge-out">Out of stock</span>}
                        </div>
                        {uniqueGallery.length > 1 && (
                            <div className="shopf-thumbs">
                                {uniqueGallery.map((img) => (
                                    <button
                                        key={img}
                                        type="button"
                                        className={`shopf-thumb${img === activeImage ? ' shopf-thumb-active' : ''}`}
                                        onClick={() => setActiveImage(img)}
                                    >
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="shopf-detail-info">
                        {product.brand && <span className="shopf-detail-brand">{product.brand}</span>}
                        <h1 className="shopf-detail-name">{product.name}</h1>

                        <div className="shopf-detail-meta">
                            <span className="shopf-detail-price">{priceText}</span>
                            <span className={`shopf-stock${product.in_stock ? '' : ' shopf-stock-out'}`}>
                                {product.in_stock ? '● In stock' : '● Out of stock'}
                            </span>
                        </div>

                        {product.condition && (
                            <div className="shopf-detail-tags">
                                <span className="shopf-tag">{product.condition}</span>
                            </div>
                        )}

                        {product.description && (
                            <div className="shopf-detail-desc">
                                {product.description.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        )}

                        <div className="shopf-detail-actions">
                            <a href={getWhatsAppUrl(waMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary shopf-wa-btn">
                                <Icon name="whatsapp" size={18} />
                                Inquire on WhatsApp
                            </a>
                            <Link to={`/shop/${catSlug}`} className="btn btn-secondary">
                                <Icon name="arrow-left" size={18} />
                                More in {catName}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
