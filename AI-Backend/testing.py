from rag.ingestion import load_and_split

x=load_and_split(r'sample_files\THE FOUR IDEOLOGICAL BIAS.pptx')

print(f'Chunks: {len(x)}')

print(x[1].page_content)