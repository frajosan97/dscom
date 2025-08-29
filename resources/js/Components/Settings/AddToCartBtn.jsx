import { Button } from "react-bootstrap";
import { useState } from "react";
import { BsCart, BsCartPlus, BsCheck } from "react-icons/bs";
import { useCart } from "@/Context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddToCartBtn({ product, quantity = 1 }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: `/storage/${product.default_image?.image_path}`,
            quantity: quantity,
        });

        // toast alert
        toast.success("Product added to cart!", {
            position: "top-center",
            autoClose: 2000,
        });

        setIsAdded(true);

        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    return (
        <Button
            variant={isAdded ? "success" : "primary"}
            className="w-100 add-to-cart-btn position-relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleAddToCart}
            disabled={isAdded}
        >
            <div className="d-flex align-items-center justify-content-center">
                <span className="me-2">
                    {/* {isAdded ? "Added to Cart!" : "Add to Cart"} */}
                </span>
                <div className="cart-icon-wrapper">
                    {isAdded ? (
                        <BsCheck size="1.5em" className="position-relative" />
                    ) : isHovered ? (
                        <BsCartPlus
                            size="1.2em"
                            className="position-relative"
                        />
                    ) : (
                        <BsCart size="1.2em" className="position-relative" />
                    )}
                </div>
            </div>

            {/* Fancy background effect on hover */}
            {isHovered && !isAdded && <div className="pulse-effect" />}

            {/* Success flash effect when added */}
            {isAdded && <div className="success-flash" />}
        </Button>
    );
}
