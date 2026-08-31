import { forwardRef } from "react";

const Card = forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`glass-panel rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

export default Card;
