import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface YAMLViewerProps {
  assetId: string
}

// Mock YAML configuration
const mockYAML = `openapi: 3.0.0
info:
  title: Customer Transaction API
  version: 2.1.0
  description: RESTful API for customer transaction data access
  contact:
    name: Data Platform Team
    email: data-platform@example.com

servers:
  - url: https://api.example.com/v2
    description: Production server
  - url: https://api-staging.example.com/v2
    description: Staging server

paths:
  /transactions:
    get:
      summary: Get transaction list
      operationId: getTransactions
      tags:
        - Transactions
      parameters:
        - name: customer_id
          in: query
          required: true
          schema:
            type: string
            format: uuid
        - name: start_date
          in: query
          schema:
            type: string
            format: date
        - name: end_date
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Transaction'
        '400':
          description: Bad request
        '401':
          description: Unauthorized

components:
  schemas:
    Transaction:
      type: object
      required:
        - transaction_id
        - customer_id
        - amount
        - timestamp
      properties:
        transaction_id:
          type: string
          format: uuid
        customer_id:
          type: string
          format: uuid
        amount:
          type: number
          format: decimal
          description: Transaction amount in USD
        timestamp:
          type: string
          format: date-time
        category:
          type: string
          enum: [PURCHASE, REFUND, TRANSFER, FEE]
        
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://auth.example.com/token
          scopes:
            read:transactions: Read transaction data
`

export function YAMLViewer({ assetId }: YAMLViewerProps) {
  const [yamlContent] = useState(mockYAML)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "YAML configuration has been copied"
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `swagger-${assetId}.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: "YAML file has been downloaded"
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="font-mono">swagger-spec.yaml</Badge>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] w-full border rounded-lg">
        <pre className="p-4 text-xs font-mono bg-muted/30">
          <code>{yamlContent}</code>
        </pre>
      </ScrollArea>
    </div>
  )
}
