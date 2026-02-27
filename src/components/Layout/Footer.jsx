export default function Footer({ className = '' }) {
  return (
    <footer
      className={`bg-primary text-white/40 text-center py-3 text-[10px] tracking-wide ${className}`}
    >
      <p className="font-medium">
        BANTAYOG ALERT &copy; {new Date().getFullYear()} &mdash; Camarines Norte PIO
      </p>
      <p className="mt-0.5 text-white/25">All-Hazard Disaster Reporting System</p>
    </footer>
  );
}
