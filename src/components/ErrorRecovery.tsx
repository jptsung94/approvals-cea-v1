import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ErrorRecoveryProps {
  assetId: string
  assetName: string
  errorType: 'auto_approval_failed' | 'governance_check_failed' | 'validation_error'
  errorMessage: string
  suggestedActions: string[]
  onRetry?: () => void
  onManualReview?: () => void
}

export function ErrorRecovery({
  assetId,
  assetName,
  errorType,
  errorMessage,
  suggestedActions,
  onRetry,
  onManualReview
}: ErrorRecoveryProps) {
  const getErrorTitle = () => {
    switch (errorType) {
      case 'auto_approval_failed':
        return 'Auto-Approval Failed'
      case 'governance_check_failed':
        return 'Governance Check Failed'
      case 'validation_error':
        return 'Validation Error'
      default:
        return 'Processing Error'
    }
  }

  const getRecoveryOptions = () => {
    switch (errorType) {
      case 'auto_approval_failed':
        return (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              The auto-approval process encountered an issue. You can either retry the automatic approval
              or proceed with manual review.
            </p>
            <div className="flex gap-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Auto-Approval
                </Button>
              )}
              {onManualReview && (
                <Button onClick={onManualReview} variant="outline" size="sm">
                  Proceed to Manual Review
                </Button>
              )}
            </div>
          </>
        )
      case 'governance_check_failed':
        return (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              One or more governance checks did not pass. Review the suggested actions below.
            </p>
            {onManualReview && (
              <Button onClick={onManualReview} variant="outline" size="sm">
                Review Details
              </Button>
            )}
          </>
        )
      case 'validation_error':
        return (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              The asset data failed validation. Please review and correct the issues.
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Retry Validation
              </Button>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card className="border-warning">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              {getErrorTitle()}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Asset: {assetName}</p>
          </div>
          <Badge variant="outline" className="border-warning text-warning">
            Needs Attention
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        {suggestedActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Suggested Actions:</h4>
            <ul className="space-y-2">
              {suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          {getRecoveryOptions()}
        </div>
      </CardContent>
    </Card>
  )
}
