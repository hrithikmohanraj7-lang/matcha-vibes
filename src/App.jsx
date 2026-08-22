import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import './App.css'

const FRAME_COUNT = 168

function Beat({ progress, range, eyebrow, title, detail, side = 'left' }) {
  const opacity = useTransform(progress, [range[0], range[0] + 0.08, range[1] - 0.08, range[1]], [0, 1, 1, 0])
  const y = useTransform(progress, [range[0], range[0] + 0.08, range[1] - 0.08, range[1]], [26, 0, 0, -26])
  return <motion.article className={`beat beat--${side}`} style={{ opacity, y }}><span className="beat__eyebrow">{eyebrow}</span><h2>{title}</h2><p>{detail}</p></motion.article>
}

function App() {
  const sceneRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ['start start', 'end end'] })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const currentFrame = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1])
  const railScale = useTransform(smoothProgress, [0, 1], [0, 1])

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true, syncTouch: true })
    let animationFrame
    const raf = (time) => { lenis.raf(time); animationFrame = requestAnimationFrame(raf) }
    animationFrame = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(animationFrame); lenis.destroy() }
  }, [])

  useEffect(() => {
    let cancelled = false
    const frames = Array.from({ length: FRAME_COUNT }, (_, index) => {
      const image = new Image()
      image.src = `/sequence/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
      image.onload = () => {
        if (!cancelled) setLoaded((value) => {
          const nextValue = value + 1
          if (nextValue === FRAME_COUNT) setReady(true)
          return nextValue
        })
      }
      return image
    })
    framesRef.current = frames
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    const draw = (frameValue = currentFrame.get()) => {
      const image = framesRef.current[Math.round(frameValue)]
      if (!image?.complete || !image.naturalWidth) return
      const scale = Math.min(window.innerWidth / image.naturalWidth, window.innerHeight / image.naturalHeight)
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * pixelRatio
      canvas.height = window.innerHeight * pixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      context.drawImage(image, (window.innerWidth - width) / 2, (window.innerHeight - height) / 2, width, height)
    }
    const unsubscribe = currentFrame.on('change', draw)
    window.addEventListener('resize', draw)
    draw()
    return () => { unsubscribe(); window.removeEventListener('resize', draw); context.clearRect(0, 0, canvas.width, canvas.height) }
  }, [currentFrame, ready])

  return <main className={ready ? 'is-ready' : 'is-loading'}>
    <div className="loader" aria-hidden={ready}><div className="loader__mark">M / A</div><div className="loader__line"><span style={{ width: `${(loaded / FRAME_COUNT) * 100}%` }} /></div><p>Preparing the pour <strong>{Math.round((loaded / FRAME_COUNT) * 100)}%</strong></p></div>
    <header className="site-header"><a className="wordmark" href="#top">MATCHA<span>/</span>VIBES CAFE</a><span className="header-note">The Village Mall / Dubai</span><a className="header-link" href="#reserve">Book a workshop <span>↗</span></a></header>
    <section className="scene" id="top" ref={sceneRef}><div className="sticky-stage">
      <canvas ref={canvasRef} aria-label="A drink splashing and assembling in slow motion" /><div className="grain" />
      <div className="hero-copy"><p className="kicker">Authentic Japanese tea culture / Jumeirah 1</p><h1>Authentic Zen<br /><em>in Jumeirah.</em></h1><p className="hero-copy__detail">Ceremonial matcha, made slowly.<br />Keep scrolling to complete the ritual.</p></div>
      <div className="scroll-cue"><span /> Drag the ritual downward</div><div className="progress-rail"><motion.span style={{ scaleY: railScale }} /></div>
      <div className="hero-info"><span>Matcha Vibes Cafe</span><span>4.9 / 575+ reviews</span><span>Jumeirah 1, Dubai</span></div>
      <Beat progress={smoothProgress} range={[0.2, 0.45]} side="left" eyebrow="01 / The base" title="Deep roast. Clean finish." detail="Twelve hour cold brew, pulled from single-origin beans and left to speak for itself." />
      <Beat progress={smoothProgress} range={[0.47, 0.7]} side="right" eyebrow="02 / The lift" title="Green light, in every layer." detail="Ceremonial matcha arrives with a bright, grassy charge. The kind of energy that changes the room." />
      <Beat progress={smoothProgress} range={[0.75, 0.97]} side="center" eyebrow="03 / The ritual" title="Make a little noise." detail="A limited first pour for the people who like their mornings with a point of view." />
    </div></section>
    <section className="business"><div className="business__intro"><p className="kicker">02 / The shop</p><h2>Make room<br /><em>for Zen.</em></h2><p>Matcha Vibes Cafe brings authentic Japanese tea culture to The Village Mall, Jumeirah 1. Come for high-end ceremonial matcha, stay for the pause.</p></div><div className="business__details"><div><span>4.9</span><p>★★★★★ / 575+ reviews</p></div><div><span>Find us</span><p>The Village Mall<br />Jumeirah 1, Dubai</p></div><a href="https://www.google.com/maps/search/?api=1&query=Matcha+Vibes+Cafe+The+Village+Mall+Dubai" target="_blank" rel="noreferrer">Open in Maps ↗</a></div></section>
    <section className="menu-section"><div className="menu-heading"><p className="kicker">03 / Signature tastings</p><h2>Green looks<br /><em>good on you.</em></h2></div><div className="menu-cards"><motion.article className="menu-card menu-card--green" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -12, rotate: -2 }} viewport={{ once: true }} transition={{ duration: .6 }}><span>01 / Pastry</span><div className="menu-card__orb">抹茶</div><h3>Matcha Eclair</h3><p>Glossy matcha glaze, delicate pastry, pure ceremony.</p></motion.article><motion.article className="menu-card menu-card--cream" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -12, rotate: 2 }} viewport={{ once: true }} transition={{ duration: .6, delay: .12 }}><span>02 / Signature</span><div className="menu-card__orb">泡</div><h3>Matcha Madness Shake</h3><p>A creamy, aesthetic pour with a little extra drama.</p></motion.article><motion.article className="menu-card menu-card--brown" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -12, rotate: -1 }} viewport={{ once: true }} transition={{ duration: .6, delay: .24 }}><span>03 / Comfort</span><div className="menu-card__orb">和</div><h3>Chicken Soup &amp; Pesto Toast</h3><p>Japanese home-style comfort with a bright twist.</p></motion.article></div></section>
    <section className="workshop"><div><p className="kicker">04 / The AED 300 experience</p><h2>Tea is a<br /><em>practice.</em></h2><p className="workshop__copy">Kimono dressing, matcha whisking, DIY matcha face-mask making, and an official certificate. A workshop worth slowing down for.</p><a className="reserve-button" href="mailto:hello@matchavibes.ae">Reserve your seat <span>↗</span></a></div><div className="workshop__details"><span>Workshop / AED 300</span><p>Small group sessions in Dubai</p><span>Order online</span><p>Message us for delivery and availability</p><a href="mailto:hello@matchavibes.ae">Contact Matcha Vibes ↗</a></div></section>
    <section className="reserve" id="reserve"><p className="kicker">Matcha Vibes Cafe / ماتشا كافيه</p><h2>Come for the<br /><em>matcha.</em></h2><p className="reserve__sub">Stay for the feeling.</p><a className="reserve-button" href="mailto:hello@matchavibes.ae">Book workshop / AED 300 <span>↗</span></a><footer><span>© Matcha Vibes Cafe</span><span>The Village Mall · Jumeirah 1</span><span>Dubai, UAE</span></footer></section>
  </main>
}

export default App
