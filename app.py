import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS
import decimal
import datetime
import json
import pytz

# --- Configuración ---
app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde el Frontend

# Configuración de la conexión a la base de datos
DB_CONFIG = {
    'user': 'root',
    'password': '',
    'host': '127.0.0.1',
    'database': 'lubricadora_jr'
}


def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error de conexión a la base de datos: {err}")
        return None


# Función para serializar fechas y decimales
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            # Convertir a zona horaria de Quito (UTC-5)
            if obj.tzinfo is None:
                # Si no tiene zona horaria, asumir que es UTC
                obj = pytz.UTC.localize(obj)
            tz = pytz.timezone('America/Guayaquil')
            obj = obj.astimezone(tz)
            return obj.isoformat()
        elif isinstance(obj, datetime.date):
            return obj.isoformat()
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(CustomJSONEncoder, self).default(obj)

app.json_encoder = CustomJSONEncoder


# --- API: Autenticación (Login) ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"success": False, "message": "Faltan datos"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "Error de conexión al servidor"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        # BUSCAMOS EN LA TABLA 'usuarios' (Español)
        cursor.execute("SELECT * FROM usuarios WHERE nombre_usuario = %s", (username,))
        user = cursor.fetchone()

        # Validación de contraseña (campo 'clave')
        if user and user['clave'] == password:
            user_data = {
                "id": user['id'],
                "username": user['nombre_usuario'],
                "full_name": user['nombre_completo'],
                "role": user['rol']
            }
            cursor.close()
            conn.close()
            return jsonify({"success": True, "message": "Inicio de sesión exitoso", "user": user_data})
        else:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {e}"}), 500


# --- API: Inventario (Productos) ---

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Consulta a tabla 'inventario' con ALIAS para mantener compatibilidad con el frontend
        query = """
            SELECT
                i.id, i.nombre as name, i.especificacion as specification, i.unidad as unit,
                i.costo as cost, i.precio_venta as price, i.stock, i.info_adicional as info,
                i.id_marca as brand_id, i.id_proveedor as supplier_id, i.id_categoria as category_id,
                i.fecha_creacion as createdAt,
                i.fecha_edicion as updatedAt,
                m.nombre as brand_name,
                p.nombre as supplier_name,
                c.nombre as category_name
            FROM inventario i
            LEFT JOIN marcas m ON i.id_marca = m.id
            LEFT JOIN proveedores p ON i.id_proveedor = p.id
            LEFT JOIN categorias c ON i.id_categoria = c.id
            ORDER BY i.nombre ASC
        """
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/inventory', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        
        # Mapeo de datos del Frontend (Inglés) a Variables para DB (Español)
        nombre = data.get('name')
        id_marca = data.get('brand_id')
        id_proveedor = data.get('supplier_id')
        id_categoria = data.get('category_id')
        especificacion = data.get('specification')
        unidad = data.get('unit')
        costo = data.get('cost')
        precio_venta = data.get('price')
        stock = data.get('stock')
        info_adicional = data.get('info')
        # id_usuario = data.get('user_id') # Podrías enviarlo desde el frontend si quieres auditoría

        # Validación de duplicados
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM inventario WHERE nombre = %s", (nombre,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Ya existe un producto llamado '{nombre}'."}), 409

        query = """
            INSERT INTO inventario
            (nombre, id_marca, id_proveedor, id_categoria, especificacion, unidad, costo, precio_venta, stock, info_adicional)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        vals = (nombre, id_marca, id_proveedor, id_categoria, especificacion, unidad, costo, precio_venta, stock, info_adicional)
        cursor.execute(query, vals)
        conn.commit()
        new_id = cursor.lastrowid
        # Devolver el objeto creado con alias
        cursor.execute("""
            SELECT 
                i.id, i.nombre as name, i.especificacion as specification, i.unidad as unit,
                i.costo as cost, i.precio_venta as price, i.stock, i.info_adicional as info,
                i.id_marca as brand_id, i.id_proveedor as supplier_id, i.id_categoria as category_id,
                i.fecha_creacion as createdAt,
                i.fecha_edicion as updatedAt,
                m.nombre as brand_name,
                p.nombre as supplier_name,
                c.nombre as category_name
            FROM inventario i
            LEFT JOIN marcas m ON i.id_marca = m.id
            LEFT JOIN proveedores p ON i.id_proveedor = p.id
            LEFT JOIN categorias c ON i.id_categoria = c.id
            WHERE i.id = %s
        """, (new_id,))
        new_prod = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(new_prod), 201
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/inventory/<int:id>', methods=['PUT'])
def update_product(id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE inventario SET 
            nombre=%s, id_marca=%s, id_proveedor=%s, id_categoria=%s, 
            especificacion=%s, unidad=%s, costo=%s, precio_venta=%s, stock=%s, info_adicional=%s,
            fecha_edicion=NOW()
            WHERE id=%s
        """
        vals = (
            data.get('name'), data.get('brand_id'), data.get('supplier_id'),
            data.get('category_id'), data.get('specification'), data.get('unit'),
            data.get('cost'), data.get('price'), data.get('stock'),
            data.get('info'), id
        )
        cursor.execute(query, vals)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Actualizado"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/inventory/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Verificar stock
        cursor.execute("SELECT stock FROM inventario WHERE id=%s", (id,))
        row = cursor.fetchone()
        if row and row[0] > 0:
            error_msg = "No se puede borrar producto con stock > 0"
            return jsonify({"error": error_msg}), 400
        cursor.execute("DELETE FROM inventario WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Eliminado"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- API: Marcas (Brands) ---
@app.route('/api/brands', methods=['GET'])
def get_marcas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Alias para compatibilidad
        cursor.execute("SELECT id, nombre as name, descripcion as description FROM marcas ORDER BY nombre ASC")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/brands', methods=['POST'])
def add_marca():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    # Insertar en español
    cursor.execute("INSERT INTO marcas (nombre, descripcion) VALUES (%s, %s)", 
                   (data.get('name'), data.get('description')))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Marca creada"}), 201

@app.route('/api/brands/<int:id>', methods=['PUT'])
def update_marca(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE marcas SET nombre=%s, descripcion=%s WHERE id=%s", 
                   (data.get('name'), data.get('description'), id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Marca actualizada"})

@app.route('/api/brands/<int:id>', methods=['DELETE'])
def delete_marca(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si la marca está en uso en el inventario
        cursor.execute("SELECT COUNT(*) FROM inventario WHERE id_marca=%s", (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": f"No se puede eliminar: la marca está siendo usada por {count} producto(s)"}), 400
        
        cursor.execute("DELETE FROM marcas WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Marca eliminada"})
    except Exception as e:
        return jsonify({"error": "No se puede eliminar: está en uso"}), 400

# --- API: Categorías (Categories) ---
@app.route('/api/categories', methods=['GET'])
def get_categorias():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre as name, descripcion as description FROM categorias ORDER BY nombre ASC")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories', methods=['POST'])
def add_categoria():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO categorias (nombre, descripcion) VALUES (%s, %s)", 
                   (data.get('name'), data.get('description')))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Categoría creada"}), 201

@app.route('/api/categories/<int:id>', methods=['PUT'])
def update_categoria(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE categorias SET nombre=%s, descripcion=%s WHERE id=%s", 
                   (data.get('name'), data.get('description'), id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Categoría actualizada"})

@app.route('/api/categories/<int:id>', methods=['DELETE'])
def delete_categoria(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si la categoría está en uso en el inventario
        cursor.execute("SELECT COUNT(*) FROM inventario WHERE id_categoria=%s", (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": f"No se puede eliminar: la categoría está siendo usada por {count} producto(s)"}), 400
        
        cursor.execute("DELETE FROM categorias WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Categoría eliminada"})
    except Exception as e:
        return jsonify({"error": "No se puede eliminar: está en uso"}), 400

# --- API: Proveedores (Suppliers) ---
@app.route('/api/suppliers', methods=['GET'])
def get_proveedores():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Mapeo de columnas español -> inglés para el frontend
        cursor.execute("SELECT id, nombre as name, ruc, telefono as phone, correo as email, persona_contacto as contact_person FROM proveedores ORDER BY nombre ASC")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/suppliers', methods=['POST'])
def add_proveedor():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "INSERT INTO proveedores (nombre, ruc, telefono, correo, persona_contacto) VALUES (%s, %s, %s, %s, %s)"
    vals = (data.get('name'), data.get('ruc'), data.get('phone'), data.get('email'), data.get('contact_person'))
    cursor.execute(query, vals)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Proveedor creado"}), 201

@app.route('/api/suppliers/<int:id>', methods=['PUT'])
def update_proveedor(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "UPDATE proveedores SET nombre=%s, ruc=%s, telefono=%s, correo=%s, persona_contacto=%s WHERE id=%s"
    vals = (data.get('name'), data.get('ruc'), data.get('phone'), data.get('email'), data.get('contact_person'), id)
    cursor.execute(query, vals)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Proveedor actualizado"})

@app.route('/api/suppliers/<int:id>', methods=['DELETE'])
def delete_proveedor(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si el proveedor está en uso en el inventario
        cursor.execute("SELECT COUNT(*) FROM inventario WHERE id_proveedor=%s", (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": f"No se puede eliminar: el proveedor está siendo usado por {count} producto(s)"}), 400
        
        cursor.execute("DELETE FROM proveedores WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Proveedor eliminado"})
    except Exception as e:
        return jsonify({"error": "No se puede eliminar: está en uso"}), 400

# --- API: Usuarios (Users) ---
@app.route('/api/users', methods=['GET'])
def get_usuarios():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre_usuario as username, nombre_completo as full_name, rol as role, fecha_creacion as created_at FROM usuarios ORDER BY nombre_completo ASC")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users', methods=['POST'])
def add_usuario():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar duplicados
        cursor.execute("SELECT id FROM usuarios WHERE nombre_usuario = %s", (data.get('username'),))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"El nombre de usuario '{data.get('username')}' ya existe."}), 409
        
        query = "INSERT INTO usuarios (nombre_usuario, clave, nombre_completo, rol) VALUES (%s, %s, %s, %s)"
        vals = (data.get('username'), data.get('password'), data.get('full_name'), data.get('role'))
        cursor.execute(query, vals)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Usuario creado exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:id>', methods=['PUT'])
def update_usuario(id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Si se envía contraseña, actualizar; si no, mantener la existente
        if data.get('password'):
            query = "UPDATE usuarios SET nombre_usuario=%s, clave=%s, nombre_completo=%s, rol=%s WHERE id=%s"
            vals = (data.get('username'), data.get('password'), data.get('full_name'), data.get('role'), id)
        else:
            query = "UPDATE usuarios SET nombre_usuario=%s, nombre_completo=%s, rol=%s WHERE id=%s"
            vals = (data.get('username'), data.get('full_name'), data.get('role'), id)
        
        cursor.execute(query, vals)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Usuario actualizado"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Usuario eliminado"})
    except Exception as e:
        return jsonify({"error": "No se puede eliminar: está en uso"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)