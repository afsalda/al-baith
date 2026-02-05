from PIL import Image
import os
import sys

def remove_black_background(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        # Change all black (also near black) pixels to transparent
        if item[0] < 50 and item[1] < 50 and item[2] < 50:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    # Crop to bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def process_image(image_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    try:
        img = Image.open(image_path)
        width, height = img.size
        
        # The image has 3 icons vertically.
        # We'll split it into 3 equal parts initially, then trim.
        
        part_height = height // 3
        
        # Top - House
        house_img = img.crop((0, 0, width, part_height))
        house_img = remove_black_background(house_img)
        house_img.save(os.path.join(output_dir, "house-3d.png"))
        print("Saved house-3d.png")
        
        # Middle - Balloon
        balloon_img = img.crop((0, part_height, width, part_height * 2))
        balloon_img = remove_black_background(balloon_img)
        balloon_img.save(os.path.join(output_dir, "balloon-3d.png"))
        print("Saved balloon-3d.png")
        
        # Bottom - Bell
        bell_img = img.crop((0, part_height * 2, width, height))
        bell_img = remove_black_background(bell_img)
        bell_img.save(os.path.join(output_dir, "bell-3d.png"))
        print("Saved bell-3d.png")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # The uploaded image path
    image_path = r"C:/Users/M S I/.gemini/antigravity/brain/2ce6d8ef-dc3e-4b1e-ac80-aa17997d1715/uploaded_media_1770292631407.jpg"
    output_dir = r"c:\Users\M S I\Downloads\al-baith\public\icons"
    process_image(image_path, output_dir)
