import { Link } from "react-router-dom";

export default function Confirmation() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-lg mb-8">Thank you for your purchase.</p>
      <Link to="/" className="text-primary underline">
        Continue Shopping
      </Link>
    </div>
  );
}
