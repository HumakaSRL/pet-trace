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
    and converts it back to hex.
    """
    r, g, b = hex_to_rgb(hex_color)
    r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0
    h, l, s = colorsys.rgb_to_hls(r_norm, g_norm, b_norm)
    new_l = max(0, min(1, l * factor))
    r_new, g_new, b_new = colorsys.hls_to_rgb(h, new_l, s)
    return rgb_to_hex((int(r_new * 255), int(g_new * 255), int(b_new * 255)))


def get_text_color(hex_color):
    """
    Choose black or white text based on the brightness of the background color.
    Uses the formula: brightness = 0.299R + 0.587G + 0.114B.
    """
    r, g, b = hex_to_rgb(hex_color)
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    return 'white' if brightness < 128 else 'black'


# Define original pastel colors
original_colors = ["#FFB6C1", "#ADD8E6",
                   "#98FB98", "#E6E6FA", "#FFFFE0", "#FFDAB9"]

# Create Variation 2 by applying a contrast factor of 1.2
variation2 = [adjust_contrast(color, 1.2) for color in original_colors]

# Generate Variation 2d by decreasing the lightness (factor 0.9)
variation2d = [adjust_lightness(color, 0.9) for color in variation2]

# Plot the Variation 2d palette with hex codes on each swatch
fig, ax = plt.subplots(figsize=(12, 2))
for i, color in enumerate(variation2d):
    ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
    text_color = get_text_color(color)
    # Display the hex code on the swatch
    ax.text(i + 0.5, 0.5, color, va='center',
            ha='center', fontsize=12, color=text_color)

ax.set_xlim(0, len(variation2d))
ax.set_ylim(0, 1)
ax.axis('off')
ax.set_title("Variation 2d Palette with Hex Codes", fontsize=16, pad=20)
plt.savefig("variation2d_selectable_palette.png", bbox_inches="tight")
plt.show()

# Print the hex codes so you can copy them as selectable text
print("Variation 2d Hex Codes:")
for color in variation2d:
    print(color)
