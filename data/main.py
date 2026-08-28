import os
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

import pandas as pd
import pytesseract
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

# Point to the Tesseract executable if it is not already on PATH.
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
DB_PATH = DATA_DIR / "games.db"
SCREENSHOT_DIR = DATA_DIR / "screenshots"
EXPORT_DIR = DATA_DIR / "exports"


def ensure_dirs():
    DATA_DIR.mkdir(exist_ok=True)
    SCREENSHOT_DIR.mkdir(exist_ok=True)
    EXPORT_DIR.mkdir(exist_ok=True)


def get_connection():
    ensure_dirs()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    ensure_dirs()
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                location TEXT NOT NULL,
                opponent TEXT NOT NULL,
                result TEXT NOT NULL CHECK(result IN ('W', 'L', 'T')),
                screenshot_path TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def copy_screenshot_to_storage(source_path: str) -> str:
    ensure_dirs()
    source = Path(source_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{source.name}"
    destination = SCREENSHOT_DIR / filename
    shutil.copy2(source, destination)
    return str(destination.relative_to(APP_DIR))


def save_game(date_value: str, location_value: str, opponent_value: str, result_value: str, screenshot_path: str):
    if not all([date_value, location_value, opponent_value, result_value, screenshot_path]):
        raise ValueError("All fields are required.")

    try:
        pytesseract.get_tesseract_version()
    except Exception:
        raise RuntimeError("tesseract is not installed or it's not in your PATH. See README for install instructions.")

    stored_path = copy_screenshot_to_storage(screenshot_path)
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO games (date, location, opponent, result, screenshot_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (date_value, location_value, opponent_value, result_value, stored_path, created_at),
        )


def fetch_games_as_dataframe():
    with get_connection() as conn:
        df = pd.read_sql_query("SELECT * FROM games ORDER BY id DESC", conn)
    return df


def export_games_to_csv():
    df = fetch_games_as_dataframe()
    export_path = EXPORT_DIR / "games.csv"
    df.to_csv(export_path, index=False)
    return export_path


class GameTrackerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Screenshot Game Tracker")
        self.root.geometry("820x650")
        self.root.minsize(760, 520)

        self.date_var = tk.StringVar()
        self.location_var = tk.StringVar(value="Home")
        self.opponent_var = tk.StringVar()
        self.result_var = tk.StringVar(value="W")
        self.screenshot_path_var = tk.StringVar()

        self._build_ui()

    def _build_ui(self):
        main_frame = ttk.Frame(self.root, padding=16)
        main_frame.pack(fill="both", expand=True)

        ttk.Label(main_frame, text="Game Metadata", font=("Segoe UI", 12, "bold")).pack(anchor="w", pady=(0, 10))

        fields = [
            ("Date", "date", self.date_var),
            ("Location", "location", self.location_var),
            ("Opponent", "opponent", self.opponent_var),
        ]

        for label_text, key, variable in fields:
            frame = ttk.Frame(main_frame)
            frame.pack(fill="x", pady=4)
            ttk.Label(frame, text=f"{label_text}:", width=14, anchor="w").pack(side="left")
            ttk.Entry(frame, textvariable=variable).pack(side="left", fill="x", expand=True)

        result_frame = ttk.Frame(main_frame)
        result_frame.pack(fill="x", pady=6)
        ttk.Label(result_frame, text="Result:", width=14, anchor="w").pack(side="left")
        ttk.Combobox(
            result_frame,
            textvariable=self.result_var,
            values=["W", "L", "T"],
            state="readonly",
            width=8,
        ).pack(side="left")

        btn_row = ttk.Frame(main_frame)
        btn_row.pack(fill="x", pady=10)
        ttk.Button(btn_row, text="Choose Screenshot", command=self.choose_screenshot).pack(side="left")
        ttk.Entry(btn_row, textvariable=self.screenshot_path_var, state="readonly", width=60).pack(side="left", fill="x", expand=True, padx=(8, 0))

        action_row = ttk.Frame(main_frame)
        action_row.pack(fill="x", pady=10)
        ttk.Button(action_row, text="Save Game", command=self.save_game).pack(side="left", padx=(0, 8))
        ttk.Button(action_row, text="View DataFrame", command=self.view_dataframe).pack(side="left", padx=(0, 8))
        ttk.Button(action_row, text="Export CSV", command=self.export_csv).pack(side="left")

        self.status_var = tk.StringVar(value="Ready")
        ttk.Label(main_frame, textvariable=self.status_var, foreground="#135e94").pack(anchor="w", pady=(6, 0))

        preview_label = ttk.Label(main_frame, text="Saved Records", font=("Segoe UI", 11, "bold"))
        preview_label.pack(anchor="w", pady=(14, 6))

        self.preview = tk.Text(main_frame, height=18, wrap="none")
        self.preview.pack(fill="both", expand=True)

        self.refresh_preview()

    def choose_screenshot(self):
        path = filedialog.askopenfilename(
            title="Select screenshot",
            filetypes=[
                ("Image files", "*.png *.jpg *.jpeg *.bmp *.webp"),
                ("All files", "*.*"),
            ],
        )
        if path:
            self.screenshot_path_var.set(path)
            self.status_var.set(f"Selected: {os.path.basename(path)}")

    def save_game(self):
        try:
            save_game(
                self.date_var.get().strip(),
                self.location_var.get().strip(),
                self.opponent_var.get().strip(),
                self.result_var.get().strip(),
                self.screenshot_path_var.get().strip(),
            )
            self.status_var.set("Game saved successfully.")
            self.clear_form()
            self.refresh_preview()
        except ValueError as exc:
            messagebox.showerror("Missing fields", str(exc))
        except RuntimeError as exc:
            messagebox.showerror("Save failed", str(exc))
        except Exception as exc:  # pragma: no cover - UI feedback only
            messagebox.showerror("Save failed", str(exc))

    def clear_form(self):
        self.date_var.set("")
        self.location_var.set("Home")
        self.opponent_var.set("")
        self.result_var.set("W")
        self.screenshot_path_var.set("")

    def refresh_preview(self):
        df = fetch_games_as_dataframe()
        self.preview.delete("1.0", tk.END)
        if df.empty:
            self.preview.insert(tk.END, "No games saved yet.")
        else:
            self.preview.insert(tk.END, df.to_string(index=False))

    def view_dataframe(self):
        df = fetch_games_as_dataframe()
        if df.empty:
            messagebox.showinfo("No records", "No games have been saved yet.")
            return
        messagebox.showinfo("DataFrame Preview", df.to_string(index=False))

    def export_csv(self):
        try:
            path = export_games_to_csv()
            self.status_var.set(f"CSV exported to {path}")
        except Exception as exc:  # pragma: no cover - UI feedback only
            messagebox.showerror("Export failed", str(exc))


if __name__ == "__main__":
    init_db()
    root = tk.Tk()
    app = GameTrackerApp(root)
    root.mainloop()
