import matplotlib.pyplot as plt
import colorsys


def hex_to_rgb(hex_color):
    """Convert hex color (e.g., '#FFB6C1') to an (R, G, B) tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    """Convert an (R, G, B) tuple to a hex color string."""
    return '#{:02X}{:02X}{:02X}'.format(*rgb)


def adjust_contrast(hex_color, factor):
    """
    Adjust the contrast of a hex color.
    Each channel is moved away from the midpoint based on the given factor.
    """
    r, g, b = hex_to_rgb(hex_color)

    def adjust_channel(c):
        new_c = ((c / 255.0 - 0.5) * factor + 0.5) * 255
        return int(max(0, min(255, new_c)))
    return rgb_to_hex((adjust_channel(r), adjust_channel(g), adjust_channel(b)))


def adjust_saturation(hex_color, factor):
    """
    Adjust the saturation of a hex color.
    Converts to HLS, multiplies the saturation by the factor, then converts back.
    """
    r, g, b = hex_to_rgb(hex_color)
    r_norm, g_norm, b_norm = r/255.0, g/255.0, b/255.0
    h, l, s = colorsys.rgb_to_hls(r_norm, g_norm, b_norm)
    new_s = max(0, min(1, s * factor))
    r_new, g_new, b_new = colorsys.hls_to_rgb(h, l, new_s)
    return rgb_to_hex((int(r_new*255), int(g_new*255), int(b_new*255)))


def adjust_lightness(hex_color, factor):
    """
    Adjust the lightness of a hex color.
    Converts to HLS, multiplies the lightness by the factor, then converts back.
    """
    r, g, b = hex_to_rgb(hex_color)
    r_norm, g_norm, b_norm = r/255.0, g/255.0, b/255.0
    h, l, s = colorsys.rgb_to_hls(r_norm, g_norm, b_norm)
    new_l = max(0, min(1, l * factor))
    r_new, g_new, b_new = colorsys.hls_to_rgb(h, new_l, s)
    return rgb_to_hex((int(r_new*255), int(g_new*255), int(b_new*255)))


# Original pastel colors and their labels
original_colors = ["#FFB6C1", "#ADD8E6",
                   "#98FB98", "#E6E6FA", "#FFFFE0", "#FFDAB9"]
color_labels = ["Light Pink", "Baby Blue", "Mint Green",
                "Lavender", "Pale Yellow", "Peach Puff"]

# Base Variation 2: Apply contrast factor of 1.2 to the original colors
variation2 = [adjust_contrast(color, 1.2) for color in original_colors]

# Create additional variations based on Variation 2:
variation2a = [adjust_saturation(color, 1.3)
               for color in variation2]  # Increased saturation
variation2b = [adjust_saturation(color, 0.7)
               for color in variation2]  # Decreased saturation
variation2c = [adjust_lightness(color, 1.1)
               for color in variation2]     # Increased lightness
variation2d = [adjust_lightness(color, 0.9)
               for color in variation2]      # Decreased lightness
variation2e = [adjust_saturation(adjust_lightness(
    color, 1.1), 1.2) for color in variation2]  # Increase both

variations = [
    ("Base Variation 2 (Contrast 1.2)", variation2),
    ("Variation 2a: Increased Saturation", variation2a),
    ("Variation 2b: Decreased Saturation", variation2b),
    ("Variation 2c: Increased Lightness", variation2c),
    ("Variation 2d: Decreased Lightness", variation2d),
    ("Variation 2e: Increased Saturation & Lightness", variation2e)
]

# Plot each variation as a row of color swatches
fig, axes = plt.subplots(nrows=len(variations), figsize=(12, 12))
plt.subplots_adjust(hspace=0.6)

for idx, (title, variation_colors) in enumerate(variations):
    ax = axes[idx]
    for i, (color, label) in enumerate(zip(variation_colors, color_labels)):
        ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
        ax.text(i + 0.5, 0.5, label, va='center',
                ha='center', fontsize=10, color='black')
    ax.set_xlim(0, len(variation_colors))
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_title(title, fontsize=14, pad=10)

plt.suptitle("Variations Derived from Variation 2", fontsize=18, y=0.95)
plt.savefig("variation2_derived_palettes.png", bbox_inches="tight")
plt.show()
