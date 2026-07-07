import os
import logging
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
import weasyprint

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        # Set up template path
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.templates_dir = os.path.join(self.base_dir, "templates")
        self.env = Environment(loader=FileSystemLoader(self.templates_dir))

    def render_html(self, resume_data: Dict[str, Any]) -> str:
        """Render the resume data into HTML using the Jinja2 template."""
        template = self.env.get_template("resume.html")
        return template.render(resume=resume_data)

    def generate_pdf(self, resume_data: Dict[str, Any]) -> bytes:
        """Compile the resume HTML to a vector PDF using WeasyPrint and return the bytes."""
        html_content = self.render_html(resume_data)
        
        # WeasyPrint compiles HTML/CSS into a binary PDF
        # We can pass stylesheets or base_url if needed for loading local fonts or assets
        try:
            pdf_bytes = weasyprint.HTML(string=html_content, base_url=self.templates_dir).write_pdf()
            return pdf_bytes
        except Exception as e:
            logger.error(f"Error compiling PDF with WeasyPrint: {e}")
            raise ValueError(f"Failed to generate PDF: {e}")
