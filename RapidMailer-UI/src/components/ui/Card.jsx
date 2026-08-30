const Card = ({ className = "", children, ...props }) => (
  <div
    className={`glass-panel rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
