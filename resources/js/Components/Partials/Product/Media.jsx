export default function MediaTab({ renderImages }) {
    return (
        <>
            <h5 className="mb-3">Product Images</h5>
            {renderImages()}
        </>
    );
}