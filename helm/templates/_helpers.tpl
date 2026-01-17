{{- define "httpProtocol" -}}
{{- if .Values.ingress.openshift -}}
https
{{- else -}}
http
{{- end -}}
{{- end -}}