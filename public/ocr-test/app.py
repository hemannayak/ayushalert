import streamlit as st
import asyncio
import os
import shutil
import json
import pandas as pd
from PIL import Image
from main import analyze_document_with_vlm, SUPPORTED_MIME_TYPES
import logging

# Ensure logs are visible
logging.basicConfig(level=logging.INFO)

# Set page config
st.set_page_config(
    page_title="Medical Document Intelligence",
    page_icon="⚕️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header { font-size: 2.5rem; font-weight: 700; color: #1E3A8A; margin-bottom: 0px; }
    .sub-header { font-size: 1.2rem; color: #64748B; margin-bottom: 30px; }
    .card { background-color: #F8FAFC; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px; border-left: 5px solid #3B82F6; }
    stMarkdown { font-family: 'Inter', sans-serif; }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">⚕️ Medical Document Intelligence</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Upload medical records, prescriptions, or lab reports for automated extraction and FHIR structuring.</div>', unsafe_allow_html=True)


# Sidebar settings
with st.sidebar:
    st.header("Upload Document")
    uploaded_file = st.file_uploader(
        "Choose an image or PDF...", 
        type=["jpg", "jpeg", "png", "gif", "webp", "pdf", "tif", "tiff"]
    )
    
    st.markdown("---")
    st.markdown("### Supported Formats")
    st.caption("Images: JPG, PNG, GIF, WEBP, TIFF\n\nDocuments: PDF")


def process_document(file) -> dict | None:
    """Helper to process the document asynchronously"""
    # 1. Determine MIME type
    ext = os.path.splitext(file.name)[1].lower()
    mime_type = SUPPORTED_MIME_TYPES.get(ext)
    
    if not mime_type:
        st.error(f"Unsupported file type. Extension: {ext}")
        return None
        
    # 2. Save file temporarily
    temp_filename = f"temp_{file.name}"
    with open(temp_filename, "wb") as buffer:
        buffer.write(file.getbuffer())
        
    # 3. Process with async Gemini call
    try:
        with st.spinner("Analyzing document with Vision AI... this may take a moment."):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            structured_data = loop.run_until_complete(
                analyze_document_with_vlm(temp_filename, mime_type)
            )
            loop.close()
        return structured_data
    except Exception as e:
        st.error(f"Error analyzing document: {str(e)}")
        return None
    finally:
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)


if uploaded_file:
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Document Preview")
        # Display Preview
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Document", use_column_width=True)
        elif ext == '.pdf':
            st.info("PDF Preview not available natively. Downloading...", icon="📄")
            # PDF preview requires extra libraries like PyMuPDF, skipping complex preview for simple MVP
        else:
            st.info(f"File uploaded: {uploaded_file.name}")
            
        process_btn = st.button("Process Document", type="primary", use_container_width=True)
        
    with col2:
        if process_btn:
            results = process_document(uploaded_file)
            
            if results:
                st.success("Analysis Complete!")
                
                # Setup Tabs for cleanly displaying response
                tab1, tab2, tab3, tab4 = st.tabs(["Overview", "Extracted Entities", "Raw JSON", "FHIR Bundle"])
                
                with tab1:
                    st.markdown("### Summary")
                    st.info(results.get("summary", "No summary provided."))
                    
                    st.markdown("### Classification")
                    cls = results.get("classification", {})
                    st.metric(label="Document Type", value=cls.get("type", "Unknown"), delta=cls.get("confidence", "Unknown") + " conf")
                    
                    st.markdown("### Metadata")
                    meta = results.get("metadata", {})
                    st.write(f"**Patient Name:** {meta.get('patient_name', 'N/A')}")
                    st.write(f"**Doctor Name:** {meta.get('doctor_name', 'N/A')}")
                    st.write(f"**Medical Center:** {meta.get('medical_center', 'N/A')}")
                    st.write(f"**Date:** {meta.get('document_date', 'N/A')}")
                
                with tab2:
                    st.markdown("### Extracted Medical Entities")
                    entities = results.get("extracted_data", [])
                    if entities:
                        df = pd.DataFrame(entities)
                        st.dataframe(df, use_container_width=True)
                    else:
                        st.warning("No entities extracted.")
                        
                with tab3:
                    st.markdown("### Output JSON")
                    # We remove fhir_bundle for a cleaner view as it's massive
                    clean_res = {k:v for k,v in results.items() if k != 'fhir_bundle'}
                    st.json(clean_res)
                    
                with tab4:
                    st.markdown("### Generated FHIR Bundle")
                    fhir_data = results.get("fhir_bundle")
                    if fhir_data:
                        st.json(fhir_data)
                    else:
                        st.warning("No FHIR Bundle generated.")
                        
else:
    st.info("👈 Please upload a medical document from the sidebar to begin.")
    
    # Show dummy cards for aesthetics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown('<div class="card"><strong>📄 Prescriptions</strong><p>Extract medicines, dosages, and instructions.</p></div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="card"><strong>🩸 Lab Reports</strong><p>Digitize blood tests, chemistry, and vitals.</p></div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="card"><strong>🧑‍⚕️ Doctor Notes</strong><p>Understand medical summaries and diagnostic notes.</p></div>', unsafe_allow_html=True)
