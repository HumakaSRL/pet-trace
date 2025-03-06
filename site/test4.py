import matplotlib.pyplot as plt
import colorsys


def hex_to_rgb(hex_color):
    """Convert a hex color (e.g., '#FFB6C1') to an (R, G, B) tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    """Convert an (R, G, B) tuple to a hex color string."""
    return '#{:02X}{:02X}{:02X}'.format(*rgb)


def adjust_contrast(hex_color, factor):
    """
    Adjust the contrast of a hex color.
    Moves each RGB channel away from the midpoint based on the factor.
    """
    r, g, b = hex_to_rgb(hex_color)

    def adjust_channel(c):
        new_c = ((c / 255.0 - 0.5) * factor + 0.5) * 255
        return int(max(0, min(255, new_c)))
    return rgb_to_hex((adjust_channel(r), adjust_channel(g), adjust_channel(b)))


def adjust_lightness(hex_color, factor):
    """
    Adjust the lightness of a hex color.
    Converts the color to HLS, multiplies the lightness by the factor,
    and then converts it back to hex.
    """
    r, g, b = hex_to_rgb(hex_color)
    r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0
    h, l, s = colorsys.rgb_to_hls(r_norm, g_norm, b_norm)
    new_l = max(0, min(1, l * factor))
    r_new, g_new, b_new = colorsys.hls_to_rgb(h, new_l, s)
    return rgb_to_hex((int(r_new * 255), int(g_new * 255), int(b_new * 255)))


# Define the original pastel colors and their labels
original_colors = ["#FFB6C1", "#ADD8E6",
                   "#98FB98", "#E6E6FA", "#FFFFE0", "#FFDAB9"]
color_labels = ["Light Pink", "Baby Blue", "Mint Green",
                "Lavender", "Pale Yellow", "Peach Puff"]

# Create Variation 2 by applying a contrast factor of 1.2 to the original colors
variation2 = [adjust_contrast(color, 1.2) for color in original_colors]

# Generate Variation 2d by decreasing the lightness of Variation 2 (factor 0.9)
variation2d = [adjust_lightness(color, 0.9) for color in variation2]

# Display Variation 2d palette
fig, ax = plt.subplots(figsize=(12, 2))
for i, (color, label) in enumerate(zip(variation2d, color_labels)):
    ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
    ax.text(i + 0.5, 0.5, label, va='center',
            ha='center', fontsize=12, color='black')

ax.set_xlim(0, len(variation2d))
ax.set_ylim(0, 1)
ax.axis('off')
ax.set_title("Variation 2d: Decreased Lightness", fontsize=16, pad=20)

plt.savefig("variation2d_palette.png", bbox_inches="tight")
plt.show()

# Print the hex values of the Variation 2d colors
print("Colors in Variation 2d:", variation2d)
