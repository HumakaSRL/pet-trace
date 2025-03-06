import matplotlib.pyplot as plt


def hex_to_rgb(hex_color):
    """Convert hex color (e.g., '#FFB6C1') to a tuple of integers (R, G, B)."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    """Convert an (R, G, B) tuple to a hex color string."""
    return '#{:02X}{:02X}{:02X}'.format(*rgb)


def adjust_contrast(hex_color, factor):
    """
    Adjust the contrast of a hex color.
    The contrast adjustment moves each RGB component away from 0.5 (in normalized [0,1] space).
    """
    r, g, b = hex_to_rgb(hex_color)

    def adjust_channel(c):
        # Normalize to [0,1], adjust contrast, then scale back to [0,255]
        new_c = ((c / 255.0 - 0.5) * factor + 0.5) * 255
        # Clamp to valid range 0-255
        return int(max(0, min(255, new_c)))
    return rgb_to_hex((adjust_channel(r), adjust_channel(g), adjust_channel(b)))


# Original pastel colors
original_colors = ["#FFB6C1", "#ADD8E6",
                   "#98FB98", "#E6E6FA", "#FFFFE0", "#FFDAB9"]
color_labels = ["Light Pink", "Baby Blue", "Mint Green",
                "Lavender", "Pale Yellow", "Peach Puff"]

# Define contrast factors for each variation (Variation 1: original, up to higher contrasts)
contrast_factors = [1.0, 1.2, 1.4, 1.6, 1.8]

# Create a figure with one row per variation
fig, axes = plt.subplots(nrows=len(contrast_factors), figsize=(12, 10))
plt.subplots_adjust(hspace=0.5)

for idx, factor in enumerate(contrast_factors):
    ax = axes[idx]
    # Adjust colors using the current contrast factor
    adjusted_colors = [adjust_contrast(color, factor)
                       for color in original_colors]

    # Draw each color as a rectangle in the current row
    for i, (color, label) in enumerate(zip(adjusted_colors, color_labels)):
        ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
        # Choose text color (black or white) based on brightness for better readability
        ax.text(i + 0.5, 0.5, label, va='center',
                ha='center', fontsize=12, color='black')

    # Set axis limits and remove axes for a clean look
    ax.set_xlim(0, len(original_colors))
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_title(
        f"Variation {idx+1} (Contrast Factor: {factor})", fontsize=14, pad=10)

# Overall title for the palette
plt.suptitle("Cute Color Palette Variations for a Website",
             fontsize=18, y=0.95)

# Save the figure as a PNG file and display it
plt.savefig("cute_color_palette_variations.png", bbox_inches="tight")
plt.show()
