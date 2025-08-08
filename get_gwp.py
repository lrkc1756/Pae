import olca
from olca import Client

client = Client(8080)  # Port must match what openLCA was started with

# Debug: list available processes
processes = list(client.get_all(olca.Process))
print(f"Found {len(processes)} processes.")
for p in processes[:10]:  # just show the first 10
    print(f"- {p.name}")

# Get the full process model
model = client.get(olca.Process, process.id)

# Run an impact assessment
setup = olca.CalculationSetup()
setup.calculation_type = olca.CalculationType.SIMPLE
setup.impact_method = client.find(olca.ImpactMethod, "EF v3.0")
setup.process = process
setup.amount = 1.0  # For 1 kg
setup.impact_categories = [client.find(olca.ImpactCategory, "climate change")]

result = client.calculate(setup)

# Extract GWP (CO2-eq)
for impact in result.impact_results:
    print(f"{impact.category.name}: {impact.value} kg CO2-eq")

if client.is_alive():
    print("✅ Connected to openLCA!")
else:
    print("❌ openLCA is not running in IPC mode.")
    exit()


#with command prompt open Open LCA
# cd C:\Users\18125\Downloads\WS24-25\SS25\openLCA_mkl_Windows_x64_2.4.1_2025-03-19\openLCA
#then open at prot 8080 by typing in CMD 
# .\openLCA.exe -p 8080

