# Permission Matrix

| Action | Default | Approval needed when |
|---|---|---|
| Read project files | allow | restricted/private files are included |
| Create docs/files | allow_with_logging | files overwrite existing work |
| Modify code | allow_with_logging | architecture/security/payment/trading modules are affected |
| Delete files | approval_required | always |
| Send email/message | approval_required | always |
| Publish/deploy/release | approval_required | always |
| Use cloud AI provider | allow | confidential/restricted data is included |
| Run live trading automation | approval_required / deny | only with explicit controls; otherwise deny |
| Reveal secrets | deny | always |
