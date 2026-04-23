import { useEffect, useReducer, useState, useCallback } from "react";
import {
  listClientsReducer,
  initialState,
} from "./reducers/listClients.reducer";
import type { ClientForm } from "../types/client.types";
import { getClients } from "../services/clients.service";

/**
 * Hook personalizado para manage the state of the client list with MongoDB.
 * Proporciona funcionalidad para cargar, filtrar, buscar y ordenar clientes.
 *
 * @returns {Object} Objeto containing client data and handler functions
 * @returns {ClientForm[]} returns.clients - Lista filtrada de clientes
 * @returns {string} returns.search - Valor actual de la busqueda
 * @returns {function} returns.searchClient - Funcion para buscar clientes por nombre/email
 * @returns {string} returns.sortField - Campo actual de ordenamiento
 * @returns {string} returns.sortDirection - Direccion de ordenamiento (asc/desc)
 * @returns {function} returns.sortBy - Funcion para ordenar por campo especifico
 * @returns {function} returns.showAll - Funcion para mostrar todos los clientes
 * @returns {function} returns.filterActiver - Funcion para filtrar solo clientes activos
 * @returns {number} returns.totalClients - Total de clientes
 * @returns {number} returns.activeClients - Numero de clientes con membresia activa
 * @returns {function} returns.reloadClients - Funcion para recargar la lista de clientes
 * @returns {string} returns.filterMode - Modo de filtro actual
 * @returns {boolean} returns.loading - Estado de carga
 */
export const useClients = () => {
  // Estado del reducer para manejar clientes
  const [state, dispatch] = useReducer(listClientsReducer, initialState);

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Calcula el total de clientes
  const totalClients = state.clients.length;

  // Calcula el numero de clientes activos
  const activeClients = state.clients.filter(
    (c) => c.memberShipStatus === "ACTIVE",
  ).length;

  /**
   * Recarga la lista de clientes desde MongoDB.
   * Obtiene todos los clientes del servicio y actualiza el estado.
   *
   * @returns {Promise<void>}
   */
  const reloadClients = useCallback(async () => {
    setLoading(true);
    try {
      const clients: ClientForm[] = await getClients();
      dispatch({ type: "SET_CLIENTS", payload: clients });
    } catch (err) {
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar clientes al iniciar el hook
  useEffect(() => {
    reloadClients();
  }, [reloadClients]);

  /**
   * Busca clientes por nombre o email.
   * Filtra los clientes segun el valor proporcionado.
   *
   * @param {string} value - Valor a buscar
   * @returns {void}
   */
  const searchClient = (value: string) => {
    dispatch({ type: "SEARCH", payload: value });
  };

  /**
   * Filtra solo los clientes con membresia activa.
   * Actualiza el modo de filtro a "ACTIVE".
   *
   * @returns {void}
   */
  const filterActiver = () => {
    dispatch({ type: "FILTER_ACTIVE" });
  };

  /**
   * Muestra todos los clientes sin filtro.
   * Restaura el modo de filtro a "ALL".
   *
   * @returns {void}
   */
  const showAll = () => {
    dispatch({ type: "FILTER_ALL" });
  };

  /**
   * Ordena los clientes por un campo especifico.
   * Soporta ordenar por cualquier campo del tipo ClientForm.
   *
   * @param {keyof ClientForm} field - Campo por el cual ordenar
   * @returns {void}
   */
  const sortBy = (field: keyof ClientForm) => {
    dispatch({ type: "SORT", payload: field });
  };

  // Retorna el estado y las funciones disponibles
  return {
    clients: state.filteredClients,
    search: state.search,
    searchClient,
    sortField: state.sortField,
    sortDirection: state.sortDirection,
    sortBy,
    showAll,
    filterActiver,
    totalClients,
    activeClients,
    reloadClients,
    filterMode: state.filterMode,
    loading,
  };
};
