from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for, g, current_app as app
from flask_login import login_required, current_user
from .models import User, Lca
from . import db
import json
import json
import os
import pandas as pd
import plotly.graph_objs as go
import plotly.io as pio


views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    _ = app.jinja_env.globals['_'] 
    print("Current language:", g.get('current_lang', 'de'))
    
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))  # Adjust 'auth.login' to match your login route

    demonstrator = [
        {"name": ("LCA"), "description": _('lca'), "image": "lca.png", "link":url_for('views.lca')},
        {"name": _('eco_design'), "description": _('eco_design_d'), "image": "eco_design.png"},
        {"name": _('ganz_energie'), "description": _('ganz_energie_d'), "image": "ganzheitliches.png"},
        {"name": _('energie_manage'), "description": _('energie_manage_d'), "image": "energy.png"},
        {"name": _('plastic_recycle'), "description": _('plastic_recycle_d'), "image": "plastic_recycling.png"}, 
        {"name": "", "description": "", "image":"logo.png"}
    ]

    return render_template("home.html", demonstrator=demonstrator, user=current_user)

@views.route('/contact')
def contact():
    _ = app.jinja_env.globals['_']
    # Dynamic data
    people = [
        {"name": "Prof. Dr. -Ing. Matthias Vette-Steinkamp", "email": "m.vette-steinkamp@umwelt-campus.de", "description": _('projektleiter'), "image": "matthias.png", "tel": "+49 6782 17 1881"},
        {"name": "Rida Ahmed, M.Sc", "email": "R.Ahmed@umwelt-campus.de", "description": _('projektleiterin'), "image": "rida.png", "tel": "+49 678217-1534"}
    ]
    return render_template("contact.html", people=people, user=current_user)

@views.route('/demo')
def demo():
    return render_template("demo.html", user=current_user)


@views.route('/about')
def about():
    return render_template("about.html", user=current_user)

@views.route('/lca')
def lca():
    return render_template("LCA_SPA.html", user=current_user)

@views.route('/impressum')
def impressum():
    return render_template("impressum.html", user=current_user)

@views.route('/datenschutz')
def datenschutz():
    return render_template("datenschutz.html", user=current_user)

@views.route('/barrier')
def barrier():
    return render_template("barrier.html", user=current_user)

@views.route('/upload_lca', methods=['GET', 'POST'])
@login_required
def upload_lca():
    import matplotlib.pyplot as plt
    import io, base64


    chart = None


    if request.method == 'POST':
        file = request.files.get('file')
        if not file or not file.filename.lower().endswith('.xlsx'):
            flash("Please upload a .xlsx file.", category='error')
            return render_template("upload_lca.html", chart=None, user=current_user)


        # save the file
        upload_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, file.filename)
        file.save(filepath)


        try:
            # === 1) read the LAST sheet (your edited 'Car' sheet) ===
            xls = pd.ExcelFile(filepath)
            last_sheet = xls.sheet_names[-1]
            df = pd.read_excel(filepath, sheet_name=last_sheet)


            # drop completely empty cols and rows
            df = df.dropna(axis=1, how='all').dropna(axis=0, how='all')


            # === 2) expect structure:
            # col A: Impact category (text)
            # col B: Reference unit (e.g., "kg CO2 eq")
            # col C..: process names (headers) with numeric values in first row
            if df.shape[0] < 1 or df.shape[1] < 3:
                raise ValueError("Sheet must have at least 1 data row and 3+ columns.")


            # process names are the headers from column 3 onward
            process_cols = df.columns[2:]
            # the values are taken from the first data row (row index 0) in those columns
            values = pd.to_numeric(df.iloc[0, 2:], errors='coerce')


            # remove empty/NaN/zero
            mask = values.notna() & (values != 0)
            process_cols = process_cols[mask]
            values = values[mask]


            if values.empty:
                raise ValueError("No non-zero numeric values found in process columns.")


            # OPTIONAL: sort by value descending for readability
            values = values.sort_values(ascending=False)
            process_cols = values.index  # keep same order as sorted values


            # y-axis label from reference unit if available
            y_label = "kg CO₂ eq"
            if 'Reference unit' in [c.strip().lower() for c in df.columns[:2].astype(str)]:
                # try to pick unit from column B if present
                try:
                    unit_text = str(df.iloc[1, 1]).strip() if len(df) > 1 else str(df.iloc[0, 1]).strip()
                    if unit_text:
                        y_label = unit_text
                except Exception:
                    pass


            # trim very long labels for display
            display_labels = [str(c)[:40] + ('…' if len(str(c)) > 40 else '') for c in process_cols]


            # === 3) plot ===
            fig, ax = plt.subplots(figsize=(11, 6))
            ax.bar(display_labels, values.values)
            ax.set_ylabel(y_label)
            ax.set_xlabel('Process')
            # title from first cell in column A if present
            title = str(df.iloc[0, 0]) if pd.notna(df.iloc[0, 0]) else "Global warming (GWP100a) für 1 Auto"
            ax.set_title(title)
            plt.xticks(rotation=45, ha='right')
            ax.grid(axis='y', linestyle='--', alpha=0.35)
            plt.tight_layout()


            # to base64 for HTML
            img = io.BytesIO()
            plt.savefig(img, format='png')
            img.seek(0)
            chart = f'<img src="data:image/png;base64,{base64.b64encode(img.read()).decode()}"/>'
            plt.close()


        except Exception as e:
            flash(f"Error reading file: {e}", category='error')


    return render_template("upload_lca.html", chart=chart, user=current_user)