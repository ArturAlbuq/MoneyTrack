import { useId, useRef, useState } from "react";
import { buildBackupFilename, exportTransactionsCsv, parseAndValidateBackupFile, restoreAppData, serializeBackup } from "../lib/backup";
import { clearAppData } from "../lib/appData";
import type { AppData, BackupData, ImportMode } from "../types";

interface SettingsScreenProps {
  appData: AppData;
  onDataChange: (data: AppData) => void;
}

interface FeedbackState {
  tone: "success" | "error";
  message: string;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SettingsScreen({ appData, onDataChange }: SettingsScreenProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [pendingImportName, setPendingImportName] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [clearConfirmation, setClearConfirmation] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  function showSuccess(message: string) {
    setFeedback({ tone: "success", message });
  }

  function showError(message: string) {
    setFeedback({ tone: "error", message });
  }

  function handleExportBackup() {
    try {
      const payload = serializeBackup(appData);
      downloadFile(
        JSON.stringify(payload, null, 2),
        buildBackupFilename(),
        "application/json;charset=utf-8"
      );
      showSuccess("Backup exportado com sucesso.");
    } catch {
      showError("Não foi possível exportar o backup agora.");
    }
  }

  function handleExportCsv() {
    try {
      const csv = exportTransactionsCsv(appData.transactions);
      downloadFile(
        csv,
        `lancamentos-${new Date().toISOString().slice(0, 10)}.csv`,
        "text/csv;charset=utf-8"
      );
      showSuccess("CSV de lançamentos exportado com sucesso.");
    } catch {
      showError("Não foi possível exportar os lançamentos em CSV.");
    }
  }

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsed = parseAndValidateBackupFile(content);
      setPendingImport(parsed);
      setPendingImportName(file.name);
      setImportMode("replace");
      setFeedback(null);
    } catch (error) {
      setPendingImport(null);
      setPendingImportName("");
      showError(error instanceof Error ? error.message : "Falha ao validar o backup.");
    } finally {
      event.target.value = "";
    }
  }

  function handleConfirmImport() {
    if (!pendingImport) {
      return;
    }

    try {
      const restored = restoreAppData(appData, pendingImport, importMode);
      onDataChange(restored);
      setPendingImport(null);
      setPendingImportName("");
      showSuccess(
        importMode === "replace"
          ? "Backup importado e dados atuais substituídos."
          : "Backup importado e dados mesclados com sucesso."
      );
    } catch {
      showError("Não foi possível concluir a importação do backup.");
    }
  }

  function handleClearAllData() {
    const cleared = clearAppData();
    onDataChange(cleared);
    setClearConfirmation("");
    setClearDialogOpen(false);
    showSuccess("Todos os dados locais foram removidos.");
  }

  const clearEnabled = clearConfirmation.trim().toUpperCase() === "LIMPAR";

  return (
    <main className="settings-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Configurações</p>
            <h2>Dados</h2>
          </div>
          <span className="pill">
            {appData.transactions.length} lançamentos
          </span>
        </div>

        <div className="settings-copy">
          <p>
            Faça backup, restaure informações locais com validação e exporte seus
            lançamentos para planilhas.
          </p>
          <p className="muted-copy">
            Schema atual: v{appData.schemaVersion}. Última atualização local em{" "}
            {new Date(appData.updatedAt).toLocaleString("pt-BR")}.
          </p>
        </div>

        {feedback ? (
          <div className={`feedback-banner ${feedback.tone}`}>
            <strong>{feedback.tone === "success" ? "Sucesso" : "Erro"}</strong>
            <p>{feedback.message}</p>
          </div>
        ) : null}

        <div className="settings-actions">
          <article className="settings-action-card">
            <div>
              <h3>Backup completo</h3>
              <p>
                Exporta lançamentos, categorias, contas, formas de pagamento, metas,
                preferências, schema e data de exportação em um único arquivo JSON.
              </p>
            </div>
            <button type="button" className="primary-button" onClick={handleExportBackup}>
              Exportar backup (.json)
            </button>
          </article>

          <article className="settings-action-card">
            <div>
              <h3>Restauração de backup</h3>
              <p>
                Valida o arquivo antes de aplicar. Você escolhe entre substituir tudo
                ou mesclar com os dados atuais.
              </p>
            </div>
            <div className="settings-action-buttons">
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={handleFileSelection}
              />
              <button
                type="button"
                className="ghost-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Importar backup (.json)
              </button>
            </div>
          </article>

          <article className="settings-action-card">
            <div>
              <h3>Planilha CSV</h3>
              <p>
                Exporta apenas os lançamentos com colunas organizadas para planilhas e
                auditoria manual.
              </p>
            </div>
            <button type="button" className="ghost-button" onClick={handleExportCsv}>
              Exportar lançamentos (.csv)
            </button>
          </article>

          <article className="settings-action-card danger-zone">
            <div>
              <h3>Limpeza total</h3>
              <p>
                Remove todos os dados locais do app neste dispositivo. A ação é
                irreversível.
              </p>
            </div>
            <button
              type="button"
              className="ghost-button danger"
              onClick={() => {
                setClearDialogOpen(true);
                setFeedback(null);
              }}
            >
              Limpar todos os dados
            </button>
          </article>
        </div>
      </section>

      {pendingImport ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-dialog-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Confirmação de importação</p>
                <h2 id="import-dialog-title">Importar {pendingImportName}</h2>
              </div>
            </div>

            <div className="settings-copy">
              <p>
                O arquivo foi validado. Escolha como aplicar o backup antes de
                concluir.
              </p>
            </div>

            <div className="import-mode-grid">
              <button
                type="button"
                className={importMode === "replace" ? "mode-card active" : "mode-card"}
                onClick={() => setImportMode("replace")}
              >
                <strong>Substituir dados atuais</strong>
                <p>
                  Remove o conteúdo local atual e restaura apenas os dados do backup.
                </p>
              </button>

              <button
                type="button"
                className={importMode === "merge" ? "mode-card active" : "mode-card"}
                onClick={() => setImportMode("merge")}
              >
                <strong>Mesclar com dados atuais</strong>
                <p>
                  Mantém seus dados atuais, adiciona o backup e evita duplicações
                  óbvias quando possível.
                </p>
              </button>
            </div>

            <div className="data-points">
              <span>{pendingImport.transactions.length} lançamentos</span>
              <span>{pendingImport.categories.length} categorias</span>
              <span>{pendingImport.accounts.length} contas</span>
              <span>{pendingImport.paymentMethods.length} formas de pagamento</span>
              <span>{pendingImport.goals.length} metas</span>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setPendingImport(null);
                  setPendingImportName("");
                }}
              >
                Cancelar
              </button>
              <button type="button" className="primary-button" onClick={handleConfirmImport}>
                Confirmar importação
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {clearDialogOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-dialog-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Atenção</p>
                <h2 id="clear-dialog-title">Limpar todos os dados</h2>
              </div>
            </div>

            <div className="settings-copy">
              <p>
                Esta ação é irreversível e apagará todos os dados locais do app neste
                dispositivo.
              </p>
              <p className="muted-copy">
                Para confirmar, digite <strong>LIMPAR</strong> no campo abaixo.
              </p>
            </div>

            <label className="dialog-field" htmlFor="clear-confirmation">
              <span>Confirmação</span>
              <input
                id="clear-confirmation"
                value={clearConfirmation}
                onChange={(event) => setClearConfirmation(event.target.value)}
                placeholder="Digite LIMPAR"
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setClearDialogOpen(false);
                  setClearConfirmation("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ghost-button danger"
                disabled={!clearEnabled}
                onClick={handleClearAllData}
              >
                Excluir tudo agora
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
