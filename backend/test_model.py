from ultralytics import YOLO
from PIL import Image
import os

def test_single_image():
    """
    A standalone script to test the YOLOv8 model on a single image,
    isolating it from the Flask application for debugging.
    """
    print("--- Starting Standalone Model Test ---")

    # --- Configuration ---
    base_dir = os.path.dirname(os.path.abspath(__file__)) # Use abspath for a more reliable base directory
    model_path = os.path.join(base_dir, 'models', 'best.pt')
    image_filename = 'c1r1e4n2_jpg.rf.7b9952eadd6778f5fa287018d4cffd01.jpg'
    image_path = os.path.join(base_dir, image_filename)

    # --- DIAGNOSTICS ---
    print("\n--- DIAGNOSTIC INFORMATION ---")
    print(f"Script's current working directory (CWD): {os.getcwd()}")
    print(f"Script's base directory (derived from __file__): {base_dir}")
    print(f"Constructed image path: {image_path}")

    # List all files in the base directory to check for the image
    print("\nFiles found in the base directory:")
    try:
        files_in_dir = os.listdir(base_dir)
        for f_name in files_in_dir:
            print(f"- {f_name}")
        
        # Check if our target file is in the list
        if image_filename in files_in_dir:
            print(f"\nSUCCESS: The image file '{image_filename}' was found in the directory.")
        else:
            print(f"\nERROR: The image file '{image_filename}' was NOT found in the directory list.")
            print("Please check for typos or if the file is in a different location.")

    except Exception as e:
        print(f"Could not list files in directory. Error: {e}")
    
    print("--- END DIAGNOSTICS ---\n")


    # --- Verification ---
    if not os.path.exists(model_path):
        print("ERROR: Model file not found. Make sure 'best.pt' is in the 'models' directory.")
        return
    if not os.path.exists(image_path):
        print("ERROR: Image file path does not exist according to os.path.exists(). Please re-check the diagnostic info above.")
        return

    # --- Model Loading and Inference ---
    try:
        print("Loading model...")
        model = YOLO(model_path)
        print("Model loaded successfully.")

        print("\nRunning inference...")
        results = model(image_path, conf=0.10)
        print("Inference complete.")

        # --- Results Analysis ---
        print("\n--- INFERENCE RESULTS ---")
        if not results or not results[0].boxes:
            print("No objects detected at all.")
            return

        detected_issues = []
        for box in results[0].boxes:
            class_id = int(box.cls)
            class_name = model.names[class_id]
            confidence = float(box.conf)
            detected_issues.append({
                "defect_type": class_name,
                "confidence": round(confidence, 4)
            })

        if not detected_issues:
            print("Model ran, but no defects were detected above the 10% confidence threshold.")
        else:
            print("Successfully detected the following defects:")
            for issue in detected_issues:
                print(f"- Type: {issue['defect_type']}, Confidence: {issue['confidence'] * 100:.2f}%")

    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == '__main__':
    test_single_image()