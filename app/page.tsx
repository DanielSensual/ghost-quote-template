import config from "../config.json";
import styles from "./page.module.css";

export default function QuotePage() {
  const { brand, stats, services, addons, gallery, contact, footer } = config;
  const fmt = (n: number) => "$" + n.toLocaleString("en-US");

  return (
    <main className={styles.main}>
      {/* ── TOPBAR ──────────────────────────────────── */}
      <header className={styles.topbar}>
        <span className={styles.topbarBrand}>{brand.name}</span>
        <span className={styles.topbarSub}>{brand.tagline}</span>
      </header>

      {/* ── HERO ────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.badge}>{brand.badge}</div>
        <h1 className={styles.h1}>{brand.heroHeadline}</h1>
        <p className={styles.heroSub}>{brand.heroSub}</p>

        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES / PRICING ──────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>SERVICES</div>
        <h2 className={styles.h2}>Choose your service.</h2>
        <p className={styles.sectionSub}>
          Transparent pricing. 50% deposit to book, balance due on completion. Pay securely online.
        </p>

        <div className={styles.servicesGrid}>
          {services.map((svc) => (
            <article
              key={svc.name}
              className={`${styles.serviceCard} ${svc.popular ? styles.serviceCardPopular : ""}`}
            >
              {svc.popular && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.serviceHeader}>
                <h3 className={styles.serviceName}>{svc.name}</h3>
                <p className={styles.serviceDesc}>{svc.description}</p>
              </div>

              <div className={styles.priceBlock}>
                <span className={styles.priceMain}>{fmt(svc.price)}</span>
              </div>

              <ul className={styles.featureList}>
                {svc.features.map((f) => (
                  <li key={f} className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className={styles.ctaGroup}>
                <a
                  href={`/checkout?amount=${svc.deposit}&desc=${encodeURIComponent(brand.name + " — " + svc.name + " (50% Deposit)")}`}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Book / Pay 50% Deposit
                </a>
                <a
                  href={`/checkout?amount=${svc.price}&desc=${encodeURIComponent(brand.name + " — " + svc.name)}`}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Pay in Full — {fmt(svc.price)}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── ADD-ONS ─────────────────────────────────── */}
      {addons.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionLabel}>ADD-ONS</div>
          <h2 className={styles.h2}>Enhance your service.</h2>
          <div className={styles.addonsGrid}>
            {addons.map((a) => (
              <div key={a.name} className={styles.addonCard}>
                <div>
                  <div className={styles.addonName}>{a.name}</div>
                  <div className={styles.addonDesc}>{a.description}</div>
                </div>
                <div className={styles.addonPrice}>+{fmt(a.price)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── GALLERY ─────────────────────────────────── */}
      {gallery.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionLabel}>OUR WORK</div>
          <h2 className={styles.h2}>See the results.</h2>
          <div className={styles.galleryGrid}>
            {gallery.map((g) => (
              <article key={g.label} className={styles.galleryCard}>
                <div className={styles.galleryImagePlaceholder}>
                  <span>{g.label}</span>
                </div>
                <div className={styles.galleryCardCopy}>
                  <h3>{g.label}</h3>
                  <p>{g.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACT / CTA ──────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionLabel}>READY TO BOOK?</div>
        <h2 className={styles.h2}>Get your property looking brand new.</h2>
        <p className={styles.sectionSub}>
          Pick a service above and pay online, or reach out directly.
        </p>
        <div className={styles.contactRow}>
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={`${styles.button} ${styles.buttonPrimary}`}>
              Call {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={`${styles.button} ${styles.buttonSecondary}`}>
              Email Us
            </a>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} {footer.legal}. All rights reserved.</span>
          <div className={styles.footerLinks}>
            {footer.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className={styles.poweredBy}>
          Powered by <a href="https://ghostaisystems.com" target="_blank" rel="noopener noreferrer">Ghost AI Systems</a>
        </div>
      </footer>
    </main>
  );
}
