# Foodfolio – Analyse des Legacy-Codes (azkaban-v3)

Quelle: `C:\Users\thoma\Documents\Coding\Stream\CLEANUP\OLD\azkaban-v3` (Stand Nov 2024 / Jan 2025).
Zweck: fachliche Referenz für das neue Domain-Modell. Die alte Architektur ist **keine** Vorlage.

## 1. Technischer Ist-Zustand

- Nx-Monorepo, NestJS-Microservices, RabbitMQ (`@MessagePattern`), TypeORM (Postgres/MySQL), React-Admin-UI mit Redux Toolkit.
- **Ein Microservice pro Entität**: `foodfolio-{category,company,item,item-detail,item-variant,location,shoppinglist,size,type,warehouse}-service`, dazu `azkaban-gateway` als HTTP-Fassade.
- Gemeinsame Libs: `libs/foodfolio-domain` (Aggregates, Factories, Repository-Interfaces, Services, ID-Value-Objects), `libs/foodfolio-infrastructure` (TypeORM-Entities, Mapper, DAOs, DTOs).
- Fremdbeziehungen nur als lose `varchar`-IDs, keine Foreign Keys, keine Relationen in TypeORM.
- Alle Services bieten nur CRUD + Soft-Delete/Restore + `activated_at`. Keine Use Cases über Entitätsgrenzen hinweg.
- Einzige Logik über mehrere Services hinweg: `cronjob-service/src/app/cronjob/OLD/shoppinglist.service.ts` (liegt bereits unter `OLD/`) erzeugt Einkaufslisten-Einträge für Items mit `isStockAlert`. Fehler werden per `catch → []` verschluckt.

## 2. Fachliches Modell (Legacy)

| Legacy-Entität | UI-Begriff | Felder (fachlich) | Verhalten |
|---|---|---|---|
| `Item` | Product | `title`, `current_sku`, `min_sku`, `max_sku` | `isStockAlert` (current < min), `isOverStocked` (current > max) |
| `ItemVariant` | Product Variant | `item_id`, `category_id`, `company_id`, `size_id`, `type_id`, `warehouse_id`, `location_id`, `title` (global unique), `sku`, `ean`, `price` | nur Setter |
| `ItemDetail` | Product Detail | `item_id`, `art_no`, `purchase_date`, `expiration_date`, `opening_date`, `returnable` | `isExpired`, `isOpen` |
| `Category` | Category | `title`, `parent_id` (Baum) | – |
| `Location` | Location | `title`, `parent_id` (Baum), `freezer` | – |
| `Company` | Brand | `title` | – |
| `Size` | Size | `title` | – |
| `Type` | Type | `title` | – |
| `Warehouse` | Warehouse | `title` | – |
| `ShoppingList` | – | `item_id`, `variant_id`, `current_sku`, `min_sku`, `max_sku` (Kopie) | – |
| – | Receipt | – | nur UI-Platzhalter, kein Backend |

`sku` meint hier Stückzahl (stock keeping units), nicht Artikelnummer.

## 3. Befunde und Schwächen

1. **Bestand ist ein manueller Zähler.** `Item.current_sku` wird per Payload gesetzt (`updateCurrentSku`) und nicht aus ItemDetails oder Bewegungen abgeleitet. Bestand und Einzelstücke können auseinanderlaufen. → Bestätigt die Entscheidung für **Bestandsbewegungen**.
2. **`ItemDetail` hängt am `Item`, nicht an der `ItemVariant`.** Ein Einzelstück weiß also nicht, welche EAN oder Größe es hat.
3. **`location_id` sitzt an der Variante.** Dieselbe Variante kann aber gleichzeitig im Kühlschrank und in der Vorratskammer liegen. Der Lagerort gehört zum physischen Bestand.
4. **`ItemDetail` hat keine Menge.** Vermutlich steht ein Datensatz für genau eine physische Einheit.
5. **Einkaufsliste kopiert Bestandswerte.** Die Einträge veralten sofort; es gibt keinen Abschluss (gekauft/erledigt).
6. **Aggregate sind Setter-Sammlungen.** Invarianten fehlen (z. B. `min_sku <= max_sku`, Menge ≥ 0, MHD nach Kaufdatum).
7. **Nicht deterministische Domain.** `isExpired()` nutzt `new Date()` direkt, ID-Value-Objects erzeugen bei `undefined` stillschweigend eine neue UUID.
8. **Microservice pro Entität** schneidet nach Tabellen statt nach fachlichen Grenzen. Das erzeugt Netzwerk-Hops ohne fachlichen Mehrwert.

## 4. Übertragbar ins neue Modell

- Produkt mit Varianten (EAN, Größe, Marke, Preis) als Katalogstruktur.
- Mindest- und Höchstbestand **pro Produkt** (variantenübergreifend). Fachlich sinnvoll: egal welche Marke Milch, Hauptsache Milch.
- Hierarchische Kategorien und hierarchische Lagerorte mit `freezer`-Kennzeichen.
- Einzelstück-Attribute: Kaufdatum, MHD, Öffnungsdatum, Pfand (`returnable`), Artikelnummer.
- Ableitung „unter Mindestbestand → Einkaufsbedarf“.

## 5. Vorschlag fachlicher Schnitt (neu)

Ein Bounded Context `foodfolio` (ein Deployable). Die Unterbereiche werden zu **Modulen innerhalb** von `libs/foodfolio/domain` und `libs/foodfolio/application`, nicht zu eigenen Services.

| Modul | Inhalt | Legacy-Herkunft |
|---|---|---|
| `catalog` | Product (min/max), ProductVariant (EAN, Größe, Marke, Verpackungsart), Category, Brand, Size, PackagingType | Item, ItemVariant, Category, Company, Size, Type |
| `storage` | StorageLocation (Baum, freezer) | Location |
| `inventory` | StockMovement, StockLot (Variante + Lagerort + Menge + MHD, Öffnung, Pfand) | ItemDetail + `current_sku` |
| `shopping` | Store (Einkaufsquelle), Einkaufsbedarf (abgeleitet), manuelle Einträge, Abhaken | Warehouse, ShoppingList + Cronjob |

Expiration (MHD-Warnungen) ist kein eigener Bereich, sondern eine Eigenschaft von Inventory-Beständen.

## 6. Erster Vertical Slice: „Bestand einbuchen“

Eingabe: ProductVariant (z. B. per EAN), Menge > 0, StorageLocation, optional MHD, optional Pfand.
Ergebnis: StockMovement vom Typ `IN` + physische Bestände am Lagerort. Der aktuelle Bestand des Produkts ergibt sich aus den Bewegungen.

## 7. Entscheidungen (2026-10-18)

| Thema | Entscheidung | Folge fürs Modell |
|---|---|---|
| `Warehouse` | war die **Einkaufsquelle** (Händler/Markt) | heißt neu `Store`, gehört zu `shopping`, nicht an die Katalog-Variante. Preis später pro Variante **und** Store. |
| `Type` | war die **Verpackungsart** (Dose, Flasche, Glas …) | heißt neu `PackagingType`, Attribut der ProductVariant. |
| Bestandsgranularität | **Charge mit Menge** | `StockLot` = Variante + Lagerort + Menge + optional MHD/Pfand. Teilentnahmen reduzieren die Menge über `StockMovement`. Öffnungsdatum pro Charge. |
| Einkaufsliste | **abgeleitet + manuell** | Bedarf wird aus Bestand vs. `min`/`max` berechnet (keine Kopie). Dazu manuelle Einträge und Abhaken beim Einkauf. |
| Einheiten | **Bestandseinheit je Produkt** | `Product.unit` (Stück, g, ml …) gilt für `min`, `max` und alle Chargen-Mengen. `ProductVariant.content` = Inhalt einer Packung in dieser Einheit (z. B. 1000 g). „2 Packungen einbuchen“ ergibt 2000 g. Teilentnahmen in der Produkteinheit möglich. |
| Öffnen | **keine Abspaltung** | `openedAt` gilt für die ganze Charge. |
| Identität Variante | **eigene ID, EAN nur Suchmerkmal** | EAN optional und nicht eindeutig (gleiche EAN bei PET/Dose, Instore-Codes, Fehleingaben). Scan liefert 0 / 1 / n Treffer → anlegen / übernehmen / auswählen. Eindeutig innerhalb eines Produkts: Marke + Größe + Verpackungsart. Titel nicht mehr global eindeutig. |
