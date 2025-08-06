import pandas as pd

# Create sample data
data = {
    'url': [
        'https://google.com',
        'https://facebook.com',
        'https://github.com',
        'youtube.com',
        'stackoverflow.com',
        'https://django-rest-framework.org',
        'python.org',
        'https://pandas.pydata.org',
        'numpy.org',
        'https://www.w3schools.com'
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
df.to_excel('sample_urls.xlsx', index=False)
print("Created sample_urls.xlsx with 10 URLs")

# Print content to check
print("\nFile content:")
print(df)