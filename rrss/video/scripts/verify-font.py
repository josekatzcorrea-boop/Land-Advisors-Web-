"""Verifica que Montserrat-Regular.ttf expone la familia 'Montserrat' para libass."""
import sys
from pathlib import Path

def read_name_table(path: Path) -> dict:
    data = path.read_bytes()
    # Minimal parse: find 'name' table via TTF offset table
    if data[:4] not in (b"\x00\x01\x00\x00", b"OTTO", b"true"):
        return {}
    num_tables = int.from_bytes(data[4:6], "big")
    for i in range(num_tables):
        off = 12 + i * 16
        tag = data[off : off + 4]
        if tag != b"name":
            continue
        table_offset = int.from_bytes(data[off + 8 : off + 12], "big")
        # name header
        count = int.from_bytes(data[table_offset + 2 : table_offset + 4], "big")
        string_offset = int.from_bytes(data[table_offset + 4 : table_offset + 6], "big")
        names = {}
        for j in range(count):
            rec = table_offset + 6 + j * 12
            name_id = int.from_bytes(data[rec + 6 : rec + 8], "big")
            length = int.from_bytes(data[rec + 8 : rec + 10], "big")
            offset = int.from_bytes(data[rec + 10 : rec + 12], "big")
            raw = data[table_offset + string_offset + offset : table_offset + string_offset + offset + length]
            try:
                names[name_id] = raw.decode("utf-16-be")
            except UnicodeDecodeError:
                names[name_id] = raw.decode("latin-1", errors="replace")
        return names
    return {}


if __name__ == "__main__":
    p = Path(sys.argv[1] if len(sys.argv) > 1 else "Montserrat-Regular.ttf")
    names = read_name_table(p)
    family = names.get(1, "?")
    full = names.get(4, "?")
    print(f"Font file: {p}")
    print(f"Family (ID 1): {family}")
    print(f"Full name (ID 4): {full}")
    ok = family == "Montserrat"
    print("OK libass Fontname=Montserrat" if ok else f"WARN: usar Fontname={family}")
    sys.exit(0 if ok else 1)
