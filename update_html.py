import os

# De HTML-fragmenten die je wilt toevoegen of injecteren
# Pas dit aan naar wat je precies wilt invoegen in de <head> en <body>
HEAD_TO_ADD = """    <link rel="stylesheet" href="styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.1/css/all.min.css" integrity="sha512-QeR2VH+lsBE5LSAe1Q5EnTBbe7XTBubt8dG93Y7gidSgdMCr8nVqKcfKAMyN96SV8KDbZVTDXChatu5G2KQGzg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link id="favicon" rel="icon" type="image/png" />
    <script>
      fetch("https://raw.githubusercontent.com/kutuzovdaniel579-jpg/www.zolarian.online/refs/heads/main/favicon.json")
        .then((response) => {
          if (!response.ok) throw new Error("Could not load favicon.json");
          return response.json();
        })
        .then((data) => {
          if (data.href) document.getElementById("favicon").href = data.href;
          if (data.title) document.title = data.title;
        })
        .catch((error) => console.error("Could not update favicon:", error));
    </script>"""

BODY_CONTENT = """  <body>
    <label>
      <input type="checkbox">
      <div class="toggle">
        <span class="top_line common"></span>
        <span class="middle_line common"></span>
        <span class="bottom_line common"></span>
      </div>

      <div class="slide">
        <h1 class="menu">MENU</h1>
        <ul>
          <li><a href="/profile"><i class="far fa-user"></i> Profile [SOON]</a></li>
          <li><a href="/pp"><i class="fa-solid fa-landmark-dome"></i> Political Party's</a></li>
          <li><a href="/discord"><i class="fa-brands fa-discord"></i> Discord</a></li>
          <li><a href="/donations"><i class="fa-solid fa-circle-dollar-to-slot"></i> Donate</a></li>
          <li><a></a></li>
          <li><a href="/settings"><i class="fas fa-cogs"></i> Settings</a></li>
          <li><a href="/about"><i class="fa-solid fa-circle-info"></i> About</a></li>
        </ul>
      </div>
    </label>
  </body>"""

def update_html_files():
    # Loop door alle mappen en bestanden vanaf de huidige locatie
    for root, dirs, files in os.walk("."):
        # Sla de .git map over
        if ".git" in root:
            continue
            
        for file in files:
            if file.endswith(".html"):
                filepath = os.path.join(root, file)
                
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Voorbeeld: Controleer of het bestand al aangepast is om dubbel werk te voorkomen
                if "zolarian.online/refs/heads/main/favicon.json" in content:
                    print(f"Overgeslagen (al bijgewerkt): {filepath}")
                    continue

                # Hier kun je logica toevoegen om te parsen of te vervangen.
                # Let op: volledig overschrijven zoals in je voorbeeld vervangt alle unieke pagina-inhoud.
                # Wil je dat elke pagina exact alleen dit menu bevat, of moet dit als template dienen?
                
                print(f"Gezien: {filepath}")

if __name__ == "__main__":
    update_html_files()
