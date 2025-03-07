import matplotlib.pyplot as plt

# Define a list of pastel colors for the palette
colors = ["#FFB6C1", "#ADD8E6", "#98FB98", "#E6E6FA", "#FFFFE0", "#FFDAB9"]
labels = ["Light Pink", "Baby Blue", "Mint Green",
          "Lavender", "Pale Yellow", "Peach Puff"]

# Create a figure and axis
fig, ax = plt.subplots(figsize=(12, 2))

# Draw each color as a rectangle and add a label in the center
for i, (color, label) in enumerate(zip(colors, labels)):
    ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
    ax.text(i + 0.5, 0.5, label, va='center',
            ha='center', fontsize=12, color='black')

# Remove axis details for a clean look
ax.set_xlim(0, len(colors))
ax.set_ylim(0, 1)
ax.axis('off')

# Add a title to reflect the cute theme
plt.title("Cute Color Palette for Pets & Animals", fontsize=16, pad=20)

# Save the image to a file and display it
plt.savefig("cute_color_palette.png", bbox_inches="tight")
plt.show()
